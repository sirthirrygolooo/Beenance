module.exports = {
    name: 'ping',
    description: 'Ping command',
    type: 1,
    options: [
      {
        name: 'subcommand',
        description: 'subcommand option',
        type: 1,
        options: [
          {
            name: 'any option',
            description: 'any option',
            type: 0,
            required: true
          }
        ]
      }
    ],
    default_member_permissions: [],
  
    run: async (interaction, client) => {
      await interaction.reply({ content: 'Pong!', ephemeral: true });
    }
  }