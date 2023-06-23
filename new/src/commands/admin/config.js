const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'config',
    description: 'Configure le bot',
    options: [
        {
            name: 'channel',
            description: 'Configure les channels utilisés par le bot',
            type: 2,
            options: [
                {
                    name: 'leaderboard',
                    description: 'Configure le channel utilisé pour afficher le classement',
                    type: 1,
                    options: [
                        {
                            name: 'channel',
                            description: 'Channel que tu souhaites utiliser',
                            type: 7,
                            required: true
                        },
                    ],
                },
                {
                    name: 'changes',
                    description: 'Configure le channel utilisé pour afficher le classement',
                    type: 1,
                    options: [
                        {
                            name: 'channel',
                            description: 'Channel que tu souhaites utiliser',
                            type: 7,
                            required: true
                        },
                    ],
                },
            ],
        },
    ],
    
    run: async (interaction, client) => {
        switch (interaction.options.getSubcommand()) {
            case 'leaderboard':
                await db.set(`leaderboardChannelId_${interaction.guild.id}`, interaction.options.getChannel('channel').id);
                return interaction.reply({ content: `Channel défini avec succès. ${interaction.options.getChannel('channel')} sera maintenant utilisé pour afficher le classement`});
            case 'changes':
                await db.set(`changesChannelId_${interaction.guild.id}`)
                return interaction.reply({ content: `Channel défini avec succès. ${interaction.options.getChannel('channel').id } sera maintenant utilisé pour afficher les changements dans le classement`});
        }
    }
}