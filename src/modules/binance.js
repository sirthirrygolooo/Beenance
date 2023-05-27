const axios = require('axios');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { EmbedBuilder } = require('discord.js');

async function updateRankings() {
    /** Cette fonction met à jour le classement sur le serveur discord */
    const topTraders = await getTopTraders();
    const oldTopTraders = await db.get(`oldTopTraders`);

    // Comparaison des classements actuel et précédent pour détecter les changements
    const changes = getRankingChanges(oldTopTraders, topTraders);
    await db.set(`oldTopTraders`, topTraders)

    // Envoi du classement dans le channel
    await sendRankingsToChannel();
    await sendRankingChangesToChannel(changes);
}

async function getTopTraders() {
    /** Cette fonction récupère les 10 premiers traders du classement 
     * @return {Object} La réponse donné par l'API
    */
    try {
        const response = await axios.get(`https://api.binance.com/api/v3/leaderboard`);
        return response.data;
    } catch (err) {
        console.error('Impossible de récupérer le classement :', err);
        return []
    }
}

function getRankingChanges(previousRanking, currentRanking) {
    /** Cette fonction permet de détecter les changements entre les classements
     * @param {Object} previousRanking  Classement précédent
     * @param {Object} currentRanking   Classement actuel
     */
    const changes = [];

    for (let i = 0; i < currentRanking.length && i < 10; i++) {
        let currentTrader = currentRanking[i];
        let currentTraderInPreviousRanking = previousRanking.find(trader => trader.username === currentTrader.username);

        if (!currentTraderInPreviousRanking) {
            // Ajout d'un nouveau trader dans le classement
            changes.push({ username: currentTrader.username, position: i + 1, type: 'add' });
        } else {
            const currentPosition = previousRanking.indexOf(currentTraderInPreviousRanking) + 1;
            const newPosition = i + 1;

            if (currentPosition < newPosition) {
                // Le trader a descendu dans le classement
                changes.push({ username: currentTrader.username, position: newPosition, type: 'down' });
            } else if (currentPosition > newPosition) {
                // Le trader a monté dans le classement
                changes.push({ username: currentTrader.username, position: newPosition, type: 'up' });
            }
        }

        // Recherche si l'ancien trader est toujours présent dans le leaderboard
        let previousTrader = previousRanking[i];
        let previousTraderInCurrentRanking = currentRanking.find(trader => trader.username === previousTrader.username);

        if (!previousTraderInCurrentRanking) {
            changes.push({ username: previousTrader.username, type: 'delete' });
        }
        return changes;
    }
}

async function sendRankingsToChannel() {
    /** Cette fonction envoie le message du classement sur Discord */
    // Récupération de la liste des serveurs utilisant la fonctionnalité */
    const guildIds = await db.get('guildIds');
    guildIds.forEach(async guildId => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
            const channel = guild.channels.cache.get(await db.get(`rankChannel_${guild.id}`));
            if (channel) {
                // Création du message de classement
                const rankingMessage = buildRankingMessage();
                // Vérifie si un message est déjà existant
                if (channel.lastMessage) {
                    channel.lastMessage.edit({ embeds: rankingMessage });
                } else {
                    channel.send({ embeds: rankingMessage });
                }
            }
        }
    })
}

function buildRankingMessage() {
    /** Cette fonction construit le message pour le classement
     * @return {Object} Renvoie l'embed créé
    */
    const topUsers = getTopTraders()
    let users;
    for (let i = 0; i < topUsers.length && i < 10; i++) {
        users += `**${i + 1}.** ${topUsers[i].username} | ${topUsers[i].profitPcnt}%\n`;
    }

    const embed = new EmbedBuilder()
        .setTitle('Classement des meilleurs traders')
        .setDescription(users)
        .setColor('Green')
        // .setImage('https://img.freepik.com/vecteurs-premium/fond-ecran-forex-trading_23-2148584743.jpg?w=2000')
        .setImage('http://thetraderinstitute.com/wp-content/uploads/2017/03/Option-Trading.jpeg')
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    return embed
}

async function sendRankingChangesToChannel(changes) {
    const guildIds = await db.get('guildIds');
    guildIds.forEach(async guildId => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
            const channel = guild.channels.cache.get(await db.get(`changesChannel_${guild.id}`));
            if (channel) {
                // Création du message de changement
                const changeMessage = buildChangeMessage(changes);
                if (changeMessage) {
                    channel.send({ content: '@everyone', embeds: changeMessage });
                }
            }
        }
    })
}

function buildChangeMessage(changes) {
    let addChanges;
    let upChanges;
    let downChanges;
    let deleteChanges;
    for (let change of changes) {
        switch (change.type) {
            case 'add':
                addChanges.push(change);
                break;
            case 'up':
                upChanges.push(change);
                break;
            case 'down':
                downChanges.push(change);
                break;
            case 'delete':
                deleteChanges.psuh(change);
                break;
        }
    }

    let description;
    if (addChanges) description += addInDescription(addChanges, '***__Nouveaux dans le classement :__**\n', true);
    if (upChanges) description += addInDescription(upChanges, '**__Montés dans le classement :__**\n', true);
    if (downChanges) description += addInDescription(downChanges, '**__Descentes dans le classement :__**\n', true);
    if (deleteChanges) description += addInDescription(deleteChanges, '**__Suppression du classement :__**\n', false);

    if (!description) return null
    const embed = new EmbedBuilder()
        .setTitle('Changement dans le classement')
        .setDescription(description)
        .setColor('Red')
        .setTimestamp()
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
    
    return embed;
}

function addInDescription(changes, type, position) {
    /** Cette fonction permet d'ajouter des éléments dans la description de l'embed
     * @param {Object} change   Liste des changements
     * @param {String} type     Type de changement
     * @param {Bool} position   Position donnée ou non
     */
    let description;
    if (changes) {
        description += type
        for (change in changes) {
            position
                ? description += `__${change.username}__ | Position : ${change.position}\n`
                : `__${change.username}__`
        }
        description += "\n"
    }
    return description;
}

module.exports = {
    updateRankings
}