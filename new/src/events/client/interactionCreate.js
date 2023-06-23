module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {
        const { guild, commandName } = interaction;

        if (guild) {
            interaction.user = interaction.guild.members.cache.get(interaction.user.id);
        }
        else {
            return interaction.reply({ content: 'Les commandes sont disponibles uniquement sur un serveur', error: true });
        }

        let fileToLoad;
        if (interaction.isChatInputCommand()) {
            fileToLoad = client.commands.get(commandName);
        }

        if (!fileToLoad) return interaction.reply({ content: 'Cette interaction n\'est pas disponible', ephemeral: true });
        fileToLoad.run(interaction, client)
            .catch(err => {
                console.error(err);
                return interaction.reply({ content: 'Une erreur est survenue durant l\'exécution de l\'interaction', ephemeral: true });
            })
    }
}