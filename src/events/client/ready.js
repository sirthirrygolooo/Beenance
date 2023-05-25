module.exports = {
    name: 'ready',
    
    run: client => {
        client.application.commands.set(client.arrayOfCommands);
        client.user.setPresence({
            activities: [{ name: 'En développement...', type: ActivityType.Streaming, url: 'https://www.twitch.tv/bsktv_' }],
            status: 'dnd',
        })
        console.log(`Bot connecté au compte ${client.user.tag}`);
    }
}