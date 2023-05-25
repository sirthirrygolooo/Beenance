let axios = require('axios');
let { QuickDB } = require('quick.db');
let { EmbedBuilder } = require('discord.js');
const DB = new QuickDB();

module.exports = {
    name: 'ready',

    run: async client => {
        client.application.commands.set(client.arrayOfCommands);
        client.user.setPresence({
            activities: [{ name: 'En développement...', type: ActivityType.Streaming, url: 'https://www.twitch.tv/bsktv_' }],
            status: 'dnd',
        })
        console.log(`Bot connecté au compte ${client.user.tag}`);
    }
}

async function getLeaderboardTopRank(client) {
    const QUERYPARAMS = `apiKey=${client.config.apiSecret}`;
    const URL = `https://api.binance.com/fapi/v1/leaderboard?${QUERYPARAMS}`;
    try {
        const RESPONSE = await axios.get(URL);
        if (RESPONSE.status === 200) {
            const LEADERBOARDDATA = RESPONSE.data;
            return LEADERBOARDDATA;
        }
        else {
            console.error(`Une erreur est survenue lors de la récupération des meilleurs traders : ${RESPONSE.status} ${RESPONSE.statusText}`)
        }
    }
    catch (err) {
        console.error(`Une erreur est survenue lors de la récupération des meilleurs traders : ${err}`)
    }
}

async function updateLeaderboardTopRank(client, leaderboard) {
    const LISTGUILDID = await DB.get('guildId');
    for (guildId in LISTGUILDID) {
        let guild = client.guilds.cache.get(guildId);
        if (guild) {
            let channel = await DB.get(`channel_${guild.id}`);
            if (channel) {
                let messageId = await DB.get(`message_${guild.id}`);
                if (messageId) {
                    channel.messages.fetch(messageId)
                        .then((fetchMessage) => {
                            if (fetchMessage) {
                                let topRankUser;
                                for (let i = 0; i < leaderboard.lengthuser; i++) {
                                    topRankUser += `${i + 1}${leaderboard[i].nickname}\n`
                                }
                                fetchMessage.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle('Classement Top Rank')
                                            .setDescription(topRankUser)
                                            .setColor('Green')
                                            .setTimestamp()
                                            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) }),
                                    ]
                                })
                            }
                        })
                }
            }
        }
    }
}