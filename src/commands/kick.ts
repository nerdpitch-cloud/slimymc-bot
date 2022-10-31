import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, inlineCode, CommandInteraction, User } from "discord.js";
import { sendDmEmbed } from "../lib/moderation/send-dm";
import { sendModLog } from "../lib/moderation/modlog";
import SlimyClient from "../client";
import { addEmbedFooter } from "../lib/embed-footer";
import { moderationSetup } from "../lib/moderation/moderation";
import { cannotPunish, ModerationAction } from "../lib/errors/common/permissions";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("kick")
		.setDescription("Kick a user")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("The member to kick")
				.setRequired(true)
		)
        .addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("Reason for the kick")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),

	async execute(client: SlimyClient, interaction: CommandInteraction) {
        let moderationCommand = await moderationSetup(client, interaction, ModerationAction.KICK)
        if(!moderationCommand) return;

        let memberTarget = await moderationCommand.guild.members.fetch(moderationCommand.target.id)

        if (!memberTarget.kickable) {
            return cannotPunish(client, interaction, ModerationAction.KICK, moderationCommand.target)
        }

        let kickEmbed = new EmbedBuilder()
            .setColor(0xe86831)
            .setTitle("You have been kicked")
            .setDescription(`You have been kicked by **${interaction.user.username}#${interaction.user.discriminator}** from **${moderationCommand.guild.name}** for: ${inlineCode(moderationCommand.reason)}`)
            .setTimestamp()
            await addEmbedFooter(client, kickEmbed);

        await sendDmEmbed(client, moderationCommand.target, kickEmbed);

        await moderationCommand.guild.members.kick(moderationCommand.target.id);

        let modlogEmbed = new EmbedBuilder()
            .setColor(0xe86831)
            .setTitle("A user has been kicked")
            .setDescription(`<@${interaction.user.id}> has kicked <@${moderationCommand.target.id}>\nwith the kicked reason:\n${inlineCode(moderationCommand.reason)}`)
            .setTimestamp()
            await addEmbedFooter(client, modlogEmbed);
            
        await sendModLog(client, modlogEmbed);

        await interaction.reply({
            content: `Kicked <@${moderationCommand.target.id}> for ${moderationCommand.reason}`,
            ephemeral: true
        });
	},
};
