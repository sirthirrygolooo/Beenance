const axios = require('axios');

const options = {
    method: 'GET',
    url: 'https://binance-futures-leaderboard1.p.rapidapi.com/v1/getOtherPosition',
    params: {
        encryptedUid: '84F16B34DDBE53A914F88EFBA67F6E6C'
    },
    headers: {
        'X-RapidAPI-Key': '055cd543a5msh9c035da15f5b96fp100da8jsn9af079ce814d',
        'X-RapidAPI-Host': 'binance-futures-leaderboard1.p.rapidapi.com'
    }
};

(async () => {
    try {
        const response = await axios.request(options);
        console.log(response.data.data);
    } catch (error) {
        console.error(error);
    }
})();