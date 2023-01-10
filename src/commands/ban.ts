import { SlashCommandBuilder, PermissionFlagsBits, CommandInteraction } from "discord.js";
import SlimyClient from "../client";
import { genModerationOptions, handleModeration, ModerationAction } from "../lib/moderation/moderation";
import { Config } from "../conf/config";
import { Command } from "./_handle";

export class BanCommand implements Command {
	name = "🔨 Ban";
	description = "Ban a user";
	syntax = "ban <user> [reason]";

	data = new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Ban a user")
		.addUserOption((option) => option.setName("user").setDescription("The member to ban").setRequired(true))

		.addStringOption((option) => option.setName("reason").setDescription("Reason for the ban").setRequired(false))

		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false);

	async execute(client: SlimyClient, config: Config, interaction: CommandInteraction) {
		const commandOptions = await genModerationOptions(interaction);

		await handleModeration(client, config, commandOptions, ModerationAction.BAN);

		await interaction.reply({
			content: `Banned <@${commandOptions.target.id}> for ${commandOptions.reason}`,
			ephemeral: true,
		});
	}
}
