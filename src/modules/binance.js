const axios = require('axios');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

/**
 * Cette fonction permet de mettre à jour le classement des utilisateurs
 * @async
 * @function updateLeaderboard
 */
async function updateLeaderboard() {
    const leaderboard = await getLeaderboard();
    const oldLeaderboard = await db.get(`oldLeaderboard`);

    const changes = getChanges(oldLeaderboard, leaderboard);
    await db.set(`oldLeaderboard`, leaderboard);

    return leaderboard, changes;
}

/**
 * Cette fonction permet de récupérer grâce à une API le classement actuel
 * @async
 * @function getLeaderboard
 * @returns {Promise<Object|null>} - La réponse de la requête web
 */
async function getLeaderboard() {
    const options = {
        method: 'GET',
        url: 'https://binance-futures-leaderboard1.p.rapidapi.com/v2/searchLeaderboard',
        params: {
            isTrader: 'false',
            isShared: 'true',
        },
        headers: {
            'X-RapidAPI-Key': '055cd543a5msh9c035da15f5b96fp100da8jsn9af079ce814d',
            'X-RapidAPI-Host': 'binance-futures-leaderboard1.p.rapidapi.com'
        }
    };
    try {
        const response = await axios.request(options);
        return response.data.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Cette fonction permet de comparer et obtenir les différents changements dans le classement
 * @function getChanges
 * @param {Object} oldLeaderboard - Ancien classement
 * @param {Object} leaderboard - Nouveau classement
 * @returns {Array|null} - La liste des changements
 */
function getChanges(oldLeaderboard, leaderboard) {
    let changes = [];
    for (let i = 0; i < leaderboard.length; i++) {
        let currentTrader = leaderboard[i];
        let previousTrader = oldLeaderboard[i];

        if (!oldLeaderboard.find(trader => trader.encryptedUid === currentTrader.encryptedUid)) {
            changes.push({ trader: currentTrader, type: 'new' });
        }
        else if (!leaderboard.find(trader => trader.encryptedUid === previousTrader.encryptedUid)) {
            changes.push({ trader: previousTrader, type: 'delete' });
        }
        else {
            const traderInOldLeaderboard = oldLeaderboard.find(trader => trader.encryptedUid === currentTrader.encryptedUid);
            if (currentTrader.rank < traderInOldLeaderboard.rank) {
                changes.push({ trader: currentTrader, type: 'up', previousRank: traderInOldLeaderboard.rank, });
            }
            else if (currentTrader.rank > traderInOldLeaderboard.rank) {
                changes.push({ trader: currentTrader, type: 'down', previousRank: traderInOldLeaderboard.rank });
            }
        }
    }
    return changes.length > 0
        ? changes
        : null;
}

module.exports = {
    updateLeaderboard,
}