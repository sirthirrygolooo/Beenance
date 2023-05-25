module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {
        const { guild, commandName } = interaction;

        if (guild) {
            interaction.user = interaction.guild.members.cache.get(interaction.user.id);
        }
        else {
            return client.say(interaction, { content: 'Les commandes ne sont disponibles uniquement sur un serveur', error: true });
        }

        let fileToLoad;
        if (interaction.isChatInputCommand()) {
            fileToLoad = client.commands.get(commandName);
        }

        if (!fileToLoad) return client.say(interaction, { content: 'Cette interaction n\'est pas disponible', error: true });
        fileToLoad.run(interaction, client)
            .catch(err => {
                console.error(err);
                return client.say(interaction, { content: 'Une erreur est survenue durant l\'exécution de l\'interaction'})
            })
    }
}