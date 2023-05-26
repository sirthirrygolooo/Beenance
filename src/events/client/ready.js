const { updateRankings } = require('../../modules/binance');

module.exports = {
    name: 'ready',

    run: async client => {
        client.applications.commands.set(client.arrayOfCommands);
        console.log('Bot ready');
        updateRankings();
        setInterval(updateRankings(), 5 * 60 * 1000);
    }
}