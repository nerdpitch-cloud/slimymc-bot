import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import SlimyClient from "../client";
import { ErrorlogChannelId } from "../conf/log.json";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("clear-error-logs")
		.setDescription("clears error logs")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

	async execute(client: SlimyClient, interaction: CommandInteraction) {
        if (!interaction.guild) throw new Error("interaction.guild was null");

        let errorLogChannel = await interaction.guild.channels.fetch(ErrorlogChannelId);

        if (errorLogChannel && errorLogChannel instanceof TextChannel ) {
            await errorLogChannel.bulkDelete(100);

            await interaction.reply({
                content: `Cleared the <#${ErrorlogChannelId}> channel`,
                ephemeral: true
            });
            return;
        }
        
        return;
    }
}