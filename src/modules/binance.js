const axios = require('axios');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

async function updateRankings() {
    /** Cette fonction met à jour le classement */
    // Récupération de l'ancien et nouveau classement
    const topTraders = await getTopTraders();
    const oldTopTraders = await db.get(`oldTopTraders`);

    // Comparaison des classements actuel et précédent pour détecter les changements
    const changes = getRankingChanges(oldTopTraders, topTraders);
    await db.set(`oldTopTraders`, topTraders);

    // Affichage du classement et des changeements
    await showRankings();
    await showRankingChanges(changes);
}

async function getTopTraders() {
    /** Cette fonction récupère les 10 premiers traders du classement
     * @return {Object} La réponse donné par l'API
     */
    try {
        // Récupération du classemrnt à travers l'API
        const response = await axios.get(`https://api.binance.com/api/v3/leaderboard`);
        return response.data;
    } catch (err) {
        console.error('Impossible de récupérer le classement :', err);
        return null
    }
}

function getRankingChanges(previousRanking, currentRanking) {
    /** Cette fonction permet de détecter les changements entre les classements
     * @param {Object} previousRanking  Classement précédent
     * @param {Object} currentRanking   Classement actuel
     * @return {List}   Liste des changements
     */
    const changes = [];
    for (let i = 0; i < currentRanking.length; i++) {
        let currentTrader = currentRanking[i];
        let previousTrader = previousRanking[i];

        // Vérification si le trader actuel était dans le classement précédent
        let currentTraderInPreviousRanking = previousRanking.find(trader => trader.username === currentTrader.username);
        // Vérification si le trader précédent est dans le classement actuel
        let previousTraderInCurrentRanking = currentRanking.find(trader => trader.username === previousTrader.username);


        // Si le trader viens d'apparaître dans le classement
        if (!currentTraderInPreviousRanking) {
            changes.push({ username: currentTrader.username, position: i + 1, type: 'add' });
        }
        else {
            const previousPosition = previousRanking.indexOf(currentTraderInPreviousRanking);
            const newPosition = i + 1;

            if (previousPosition < newPosition) {
                // Le trader a descendu dans le classement
                changes.push({ username: currentTrader.username, position: newPosition, type: 'down' });
            } else if (previousPosition > newPosition) {
                // Le trader est monté dans le classement
                changes.push({ username: currentTrader.username, position: newPosition, type: 'up' });
            }
        }
        // Si le trader viens de disparaitre dans le classement
        if (!previousTraderInCurrentRanking) {
            changes.push({ username: previousTrader.username, type: 'delete' });
        }
        else {
            const previousPosition = i + 1;
            const newPosition = currentRanking.indexOf(previousTraderInCurrentRanking);

            if (previousPosition < newPosition) {
                // Le trader a descendu dans le classement
                changes.push({ username: currentTrader.username, position: newPosition, type: 'down' });
            } else if (previousPosition > newPosition) {
                // Le trader est monté dans le classement
                changes.push({ username: currentTrader.username, position: newPosition, type: 'up' });
            }
        }
        return changes;
    }
}

async function showRankings() {
    console.clear();
    const topUsers = await getTopTraders();
    for (let i = 0; i < topUsers.length && i < 10; i++) {
        console.log(`**${i + 1}.** ${topUsers[i].username} | ${topUsers[i].profitPcnt}%`)
    }
    return
}

async function showRankingChanges(changes) {
    if (changes) {
        console.log(convertChanges(changes));
    }
}

function convertChanges(changes) {
    let listOfChanges;
    for (change of changes) {
        switch (change.type) {
            case 'add':
                listOfChanges += `${change.username} a rejoins le classement à la position n°${change.position}\n`;
                break;
            case 'remove':
                listOfChanges += `${change.username} a quitté le classement\n`;
                break;
            case 'up':
                listOfChanges += `${change.username} est monté à la position n°${change.position}\n`;
                break;
            case 'down':
                listOfChanges += `${change.username} est descendu à la position n°${change.position}\n`;
                break;
        }
    }
    return listOfChanges;
}