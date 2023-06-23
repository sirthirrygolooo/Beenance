const { updateLeaderboard } = require('../../modules/binance');
const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'ready',
    run: async client => {
        client.application.commands.set(client.arrayOfCommands);
        console.log('Bot ready :', client.user.tag);
        setInterval(async () => updateBinance(client), 5 * 1000);
    }
}

/**
 * Cette fonction met à jour le classement et envoie un message de changement sur les serveurs Discord configurés
 * @param {Object} client   - Client Discord 
 */
async function updateBinance(client) {
    let output = await updateLeaderboard();
    let leaderboard = output[0];
    let changes = output[1];

    client.guilds.cache.forEach(async (guild) => {
        console.log('Récupération du channel');
        let channel = await getLeaderboardChannel(guild);
        let channelLeaderboard = channel[0];
        let channelChanges = channel[1];
        if (channelLeaderboard) {
            sendLeaderbaord(channelLeaderboard, leaderboard, client);
        }
        if (channelChanges && changes) {
            sendChanges(channelChanges, changes, client);
        }
    })
}

/**
 * Cette fonction récupère le channel utilisé pour le classement Binance
 * @async
 * @function getLeaderboardChannel
 * @param {Object} guild - Le serveur utilisé 
 * @returns {Object} - Le channel utilisé 
 */
async function getLeaderboardChannel(guild) {
    const channelLeaderboard = guild.channels.cache.get(await db.get(`leaderboardChannelId_${guild.id}`));
    const channelChanges = guild.channels.cache.get(await db.get(`changesChannelId_${guild.id}`));
    return [channelLeaderboard, channelChanges];
}

/**
 * Cette fonction envoie le classement dans un channel Discord
 * @function sendLeaderbaord
 * @param {Object} channel  - Channel qui contiendra le message
 * @param {Array} leaderboard - Classement des meilleurs utilisateurs
 * @param {Object} client - Client Discord
 */
function sendLeaderbaord(channel, leaderboard, client) {
    channel.messages.fetch({ limit: 1 })
        .then(message => {
            let description;
            leaderboard.forEach(trader => {
                console.log(trader);
                description += `\`${trader.rank}\`︱[**__${trader.nickName}__**](${trader.leaderboardUrl})・*${trader.followerCount}*\n`
            });
            const embed = new EmbedBuilder()
                .setTitle('Classement Binance')
                .setDescription(description)
                .setImage('https://conseilscrypto.com/wp-content/uploads/2022/01/Binance-lance-un-service-de-grid-trading-permettant-dautomatiser-lachat-et-la-vente-de-Bitcoin-et-de-cryptomonnaies-sur-le-marche-au-comptant.jpg')
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setColor('Yellow');

            channel.bulkDelete(1);
            channel.send({ embeds: [embed] });
        });
}

/**
 * Cette fonction envoie la liste des changements dans un channel Discord
 * @function sendChanges
 * @param {Object} channel  - Channel qui contiendra le message
 * @param {Array} changes - Liste des changements
 * @param {Object} client - Client Discord
 */
function sendChanges(channel, changes, client) {
    let description;
    if (changes.up) {
        description += '**__Montée dans le classement__**\n';
        for (change in changes.up) {
            description += `[**__${change.trader.nickName}__**](${change.trader.leaderboardUrl}) est monté dans le classement︱Précédent : ${change.previousRank}︱Nouveau : ${change.trader.rank}\n`;
        }
    }
    if (changes.down) {
        description += '\n**__Descente dans le classement__**\n';
        for (change in changes.down) {
            description += `[**__${change.trader.nickName}__**](${change.trader.leaderboardUrl}) est descendu dans le classement︱Précédent : ${change.previousRank}︱Nouveau : ${change.trader.rank}\n`;
        }
    }
    if (changes.new) {
        description += '\n**__Arrivée dans le classement__**\n';
        for (change in changes.new) {
            description += `[**__${change.trader.nickName}__**](${change.trader.leaderboardUrl}) est arrivé dans le classement︱Rank : ${change.trader.rank}`;
        }
    }
    if (changes.delete) {
        description += '\n**__Disparition du classement__**\n';
        for (change in changes.delete) {
            description += `[**__${change.trader.nickName}__**](${change.trader.leaderboardUrl}) a disparu du le classement︱Ancien rank : ${change.trader.rank}`;
        }
    }

    const embed = new EmbedBuilder()
        .setTitle('Changements dans le classement')
        .setDescription(description)
        .setImage('https://public.bnbstatic.com/image/cms/blog/20220601/31506c78-a1a4-454a-8fca-1d24f2ca22fc.png')
        .setTimestamp()
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setColor('Yellow');

    channel.send({ content: '@everyone', embeds: [embed] });
}