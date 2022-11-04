import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, inlineCode, CommandInteraction, User } from "discord.js";
import { sendDmEmbed } from "../lib/moderation/send-dm"
import { sendModLog } from "../lib/moderation/modlog";
import SlimyClient from "../client";
import { addEmbedFooter } from "../lib/embed-footer";
import { moderationSetup } from "../lib/moderation/moderation";
import { cannotPunish } from "../lib/errors/common/permissions";
import { ModerationAction } from "../lib/moderation/moderation";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Ban a user")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("The member to ban")
				.setRequired(true)
		)
        .addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("Reason for the ban")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

	async execute(client: SlimyClient, interaction: CommandInteraction) {
        let moderationCommand = await moderationSetup(client, interaction, ModerationAction.BAN)
        if(!moderationCommand) throw new Error("moderationCommand was null");

        let memberTarget = await moderationCommand.guild.members.fetch(moderationCommand.target.id)

        if (!memberTarget.bannable) {
            return cannotPunish(client, interaction, ModerationAction.BAN, moderationCommand.target)
        }

        let banEmbed = new EmbedBuilder()
            .setColor(0xbb2525)
            .setTitle("You have been banned")
            .setDescription(`You have been banned by **${interaction.user.username}#${interaction.user.discriminator}** from **${moderationCommand.guild.name}** for: ${inlineCode(moderationCommand.reason)}`)
            .setTimestamp()
            await addEmbedFooter(client, banEmbed);

        await sendDmEmbed(client, moderationCommand.target, banEmbed);

        await moderationCommand.guild.members.ban(moderationCommand.target.id);

        let modlogEmbed = new EmbedBuilder()
            .setColor(0x1058e8)
            .setTitle("A user has been banned")
            .setDescription(`<@${interaction.user.id}> has banned <@${moderationCommand.target.id}>\nwith the following reason:\n${inlineCode(moderationCommand.reason)}`)
            .setTimestamp()
            await addEmbedFooter(client, modlogEmbed);

        await sendModLog(client, modlogEmbed)

        await interaction.reply({
            content: `Banned <@${moderationCommand.target.id}> for ${moderationCommand.reason}`,
            ephemeral: true
        });
	},
};
