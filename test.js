const axios = require('axios');

const options = {
    method: 'GET',
    url: 'https://binance-futures-leaderboard1.p.rapidapi.com/v2/getTraderInfo',
    params: {
        encryptedUid: '21CD087408060BDD97F001B72CC2B0D3'
    },
    headers: {
        'X-RapidAPI-Key': '055cd543a5msh9c035da15f5b96fp100da8jsn9af079ce814d',
        'X-RapidAPI-Host': 'binance-futures-leaderboard1.p.rapidapi.com'
    }
};

(async () => {
    try {
        const response = await axios.request(options);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
})()