const { EmbedBuilder } = require("discord.js");
const config = require('../../config.json');

module.exports = (interaction, message) => {
	if (!interaction) {
		throw Error("L'interaction n'a pas été indiqué en paramètre");
	}
	if (!message.content || typeof message.content !== "string") {
		throw Error("Aucun contenu n'a été indiqué en paramètre");
	}

	const embed = new EmbedBuilder()
		.setDescription(`> ${message.content}`)
		.setFooter({ text: `${interaction.client.user.username}`, iconURL: `${interaction.client.user.displayAvatarURL({ dynamic: true })}` })
		.setTimestamp()
		.setColor(message.error ? "Red" : config.color);

	if (message.title) embed.setTitle(message.title);

	if (message.error) message.ephemeral = true;

	if (interaction.deferred) {
		return interaction.followUp({ embeds: [embed] }).catch(error => console.error(error));
	}
	else if (interaction.replied) {
		return interaction.editReply({ embeds: [embed], ephemeral: message.ephemeral }).catch(error => console.error(error));
	}
	else if (message.update) {
		return interaction.update({ embeds: [embed], components: [] }).catch(error => console.error(error));
	}
	else {
		return interaction.reply({ embeds: [embed], ephemeral: message.ephemeral }).catch(error => console.error(error));
	}
};