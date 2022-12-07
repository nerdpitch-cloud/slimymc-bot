import { CommandInteraction } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { handleUnexpectedError } from "../lib/errors/handler";

export async function handleCommand(client: SlimyClient, config: Config, interaction: CommandInteraction) {
	const command = client.commands.get(interaction.commandName);

	if (!command) {
		handleUnexpectedError(client, `No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(client, config, interaction);
	} catch (error) {
		handleUnexpectedError(client, error);
		await interaction.reply({
			content: "There was an error while executing this command, log has been send to the error logs channel and will be resolved",
			ephemeral: true,
		});
	}
}
