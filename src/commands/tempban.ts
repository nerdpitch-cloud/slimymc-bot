import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, inlineCode, CommandInteraction, User } from "discord.js";
import { sendDmEmbed } from "../lib/moderation/send-dm";
import { sendModLog } from "../lib/moderation/modlog";
import SlimyClient from "../client";
import { addEmbedFooter } from "../lib/embed-footer";
import { moderationSetup } from "../lib/moderation/moderation";
import { cannotPunish } from "../lib/errors/common/permissions";
import { ModerationAction } from "../lib/moderation/moderation";
import { TempBanFile } from "../lib/moderation/tempban";
import { InfractionsDB } from "../lib/mysql/infractions";
import { handleExpectedError, handleUnexpectedError } from "../lib/errors/handler";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("tempban")
		.setDescription("tempban a user")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The member to tempban")
				.setRequired(true)
		)        
        .addIntegerOption((option) =>
            option
                .setName("duration")
                .setDescription("Duration of the tempban (IN HOURS)")
                .setRequired(true)
        )
        .addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("Reason for the tempban")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),

	async execute(client: SlimyClient, interaction: CommandInteraction) {
        let moderationCommand = await moderationSetup(client, interaction, ModerationAction.TEMPBAN)
        if(!moderationCommand) throw new Error("moderationCommand was null");
        if(!moderationCommand.duration) throw new Error("moderationCommand.duration was null/undefined");

        let memberTarget = await moderationCommand.guild.members.fetch(moderationCommand.target.id)

        if (!memberTarget.kickable) {
            return cannotPunish(client, interaction, ModerationAction.TEMPBAN, moderationCommand.target)
        }

        let dbRes = await InfractionsDB.addInfraction(moderationCommand.target.id, ModerationAction.TEMPBAN, moderationCommand.reason)
        if (!dbRes.result) return handleUnexpectedError(client, dbRes.result);

        let durationTimestamp = await TempBanFile.genExpiration(moderationCommand.duration)

        let kickEmbed = new EmbedBuilder()
            .setColor(0xbb2525)
            .setTitle("You have been temporarily banned")
            .setDescription(`You have been kicked by **${interaction.user.username}#${interaction.user.discriminator}** from **${moderationCommand.guild.name}** \nfor the duration of **${moderationCommand.duration} hours** (expires on <t:${durationTimestamp}>\nfor: ${inlineCode(moderationCommand.reason)}`)
            .setTimestamp()
            await addEmbedFooter(client, kickEmbed);
        await sendDmEmbed(client, moderationCommand.target, kickEmbed);

        await moderationCommand.guild.members.ban(moderationCommand.target.id);

        TempBanFile.addMember(moderationCommand.target.id, moderationCommand.guild.id, durationTimestamp)

        let modlogEmbed = new EmbedBuilder()
            .setColor(0x5110e8)
            .setTitle("A user has been temporarily banned")
            .setDescription(`<@${interaction.user.id}> temporarily banned <@${moderationCommand.target.id}>\nfor **${moderationCommand.duration} hours** (expires on <t:${durationTimestamp}>\nwith the following reason:\n${inlineCode(moderationCommand.reason)}`)
            .setTimestamp()
            await addEmbedFooter(client, modlogEmbed);
        await sendModLog(client, modlogEmbed);

        await interaction.reply({
            content: `Temporarily banned <@${moderationCommand.target.id}> for ${moderationCommand.reason}`,
            ephemeral: true
        });
	},
};
