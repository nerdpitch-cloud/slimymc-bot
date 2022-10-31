import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import SlimyClient from "../client";
import { ErrorChannelId } from "../conf/log.json";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clear-error-logs")
		.setDescription("clears error logs")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

	async execute(client: SlimyClient, interaction: CommandInteraction) {
        if (!interaction.guild) return;

        let errorLogChannel = await interaction.guild.channels.fetch(ErrorChannelId);

        if (errorLogChannel && errorLogChannel instanceof TextChannel ) {
            await errorLogChannel.bulkDelete(100);

            await interaction.reply({
                content: `Cleared the <#${ErrorChannelId}> channel`,
                ephemeral: true
            });
            return;
        }
        
        return;
    }
}