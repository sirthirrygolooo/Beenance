const { PermissionsBitField } = require("discord.js");
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
                    description: 'Configure le channel où le classement sera envoyé',
                    type: 1,
                    options: [
                        {
                            name: 'channel',
                            description: 'Channel que tu souhaites utiliser',
                            type: 7,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'changes',
                    description: 'Configure le channel où sera envoyé les notifications de changement',
                    type: 1,
                    options: [
                        {
                            name: 'channel',
                            description: 'Channel que tu souhaites utiliser',
                            type: 7,
                            required: true,
                        },
                    ],
                },
            ],
        },
    ],
    default_member_permissions: [PermissionsBitField.Flags.Administrator],

    run: async (interaction, client) => {
        switch (interaction.getSubcommand()) {
            case 'leaderboard':
                await db.set(`leaderboardChannelId_${guild.id}`, interaction.options.getChannel('channel'));
                return interaction.reply({ content: 'Le channel a été défini avec succès. Le classement apparaitra lors de la prochaine actualisation (5/10min en moyenne)', ephemeral: true });
            case 'changes':
                await db.set(`changesChannelId_${guild.id}`, interaction.options.getChannel('channel'));
                return interaction.reply({ content: 'Le channel a été défini avec succès. Les changements s\'y afficheront lorsqu\'au moins 2 classements ont été affichés', ephemeral: true });
        }
    }
}