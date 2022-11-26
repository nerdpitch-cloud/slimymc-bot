import { SlashCommandBuilder, PermissionFlagsBits, CommandInteraction } from "discord.js";
import SlimyClient from "../client";
import { genModerationOptions, handleModeration } from "../lib/moderation/moderation";
import { ModerationAction } from "../lib/moderation/moderation";
import { Config } from "../conf/config";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("warn")
		.setDescription("Warn a user")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The member to warn")
				.setRequired(true)
		)
        .addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("Reason for the warning")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: CommandInteraction) {
        let commandOptions = await genModerationOptions(interaction);

        await handleModeration(client, config, commandOptions, ModerationAction.TEMPMUTE)

        await interaction.reply({
            content: `Warned <@${commandOptions.target.id}> for ${commandOptions.reason}`,
            ephemeral: true
        });
	},
};
