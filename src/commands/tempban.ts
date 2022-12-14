import { SlashCommandBuilder, PermissionFlagsBits, CommandInteraction } from "discord.js";
import SlimyClient from "../client";
import { genModerationOptions, handleModeration } from "../lib/moderation/moderation";
import { ModerationAction } from "../lib/moderation/moderation";
import { Config } from "../conf/config";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("tempban")
		.setDescription("tempban a user")
		.addUserOption((option) => option.setName("user").setDescription("The member to tempban").setRequired(true))
		.addIntegerOption((option) => option.setName("duration").setDescription("Duration of the tempban (IN HOURS)").setRequired(true))
		.addStringOption((option) => option.setName("reason").setDescription("Reason for the tempban").setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: CommandInteraction) {
		const commandOptions = await genModerationOptions(interaction);

		await handleModeration(client, config, commandOptions, ModerationAction.TEMPBAN);

		await interaction.reply({
			content: `Temporarily banned <@${commandOptions.target.id}> for ${commandOptions.reason}`,
			ephemeral: true,
		});
	},
};
