const { Client, Collection, IntentsBitField } = require('discord.js');
const client = new Client({
    intents: new IntentsBitField(3276799)
});

client.commands = new Collection();
client.config = require('./src/modules/config.json');

require('./src/modules/handler')(client);
client.login(client.config.token);