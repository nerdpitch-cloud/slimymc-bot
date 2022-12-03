import { SlashCommandBuilder, PermissionFlagsBits, CommandInteraction } from "discord.js";
import SlimyClient from "../client";
import { genModerationOptions, handleModeration, ModerationAction } from "../lib/moderation/moderation";
import { Config } from "../conf/config";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("tempmute")
		.setDescription("tempmute a user")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The member to tempmute")
				.setRequired(true)
		)
        .addIntegerOption((option) =>
        option
            .setName("duration")
            .setDescription("Duration of the tempmute (IN HOURS)")
            .setRequired(true)
    )
        .addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("Reason for the tempmute")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: CommandInteraction) {
        let commandOptions = await genModerationOptions(interaction);

        await handleModeration(client, config, commandOptions, ModerationAction.TEMPMUTE)

        await interaction.reply({
            content: `temporarily muted <@${commandOptions.target.id}> for ${commandOptions.reason}`,
            ephemeral: true
        });
    }
}
