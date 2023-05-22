const { Client, Collection, IntentsBitField, Partials } = require('discord.js'),
    client = new Client({
        intents: new IntentsBitField(3276799),
        partials: [Partials.Channel],
    });

client.commands = new Collection();
client.config = require('./src/modules/config.json');
client.say = require('./src/modules/embeds.js')

require('./src/modules/handler')(client);
client.login(client.config.token);