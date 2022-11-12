import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, inlineCode, CommandInteraction, User } from "discord.js";
import { sendDmEmbed } from "../lib/moderation/send-dm";
import { sendModLog } from "../lib/moderation/modlog";
import SlimyClient from "../client";
import { addEmbedFooter } from "../lib/embed-footer";
import { moderationSetup } from "../lib/moderation/moderation";
import { ModerationAction } from "../lib/moderation/moderation";
import { InfractionsDB } from "../lib/mysql/infractions";
import { handleUnexpectedError } from "../lib/errors/handler";
import { TempBanFile } from "../lib/moderation/tempban";

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

	async execute(client: SlimyClient, interaction: CommandInteraction) {
        let moderationCommand = await moderationSetup(client, interaction, ModerationAction.WARN)
        if(!moderationCommand) throw new Error("moderationCommand was null");

        let dbRes = await InfractionsDB.addInfraction(moderationCommand.target.id, ModerationAction.WARN, moderationCommand.reason)
        if (!dbRes.result) return handleUnexpectedError(client, dbRes.result);

        let memberTarget = await moderationCommand.guild.members.fetch(moderationCommand.target.id);
        let recentInfractions = await InfractionsDB.getRecentInfractions(moderationCommand.target.id);
        let additionalPunishment = "No additional punishment"
        
        if (recentInfractions.result.length == 2) {
            await memberTarget.timeout(1 * 3600000, moderationCommand.reason); // 1 hour
            additionalPunishment = "1 hour timeout";

        } else if(recentInfractions.result.length == 3 || recentInfractions.result.length == 4) {
            await memberTarget.timeout(24 * 3600000, moderationCommand.reason); // 24 hours
            additionalPunishment = "24 hour timeout";

        } else if (recentInfractions.result.length >= 5) {
            additionalPunishment = "1 week temporary ban";

            let durationTimestamp = await TempBanFile.genExpiration(168);
            TempBanFile.addMember(moderationCommand.target.id, moderationCommand.guild.id, durationTimestamp)
        }

        let warnEmbed = new EmbedBuilder()
            .setColor(0xbb2525)
            .setTitle("You have been warned")
            .setDescription(`You have been warned by **${interaction.user.username}#${interaction.user.discriminator}** in **${moderationCommand.guild.name}** for: ${inlineCode(moderationCommand.reason)}\nSince you have received ${recentInfractions.result.length} warning already, you have also gotten an additional punishment in type of: ${additionalPunishment}`)
            .setTimestamp()
            await addEmbedFooter(client, warnEmbed);

        await sendDmEmbed(client, moderationCommand.target, warnEmbed);

        if (additionalPunishment === "1 week temporary ban") {
            await moderationCommand.guild.members.ban(moderationCommand.target.id, { reason: moderationCommand.reason });
        }
        
        let modlogEmbed = new EmbedBuilder()
            .setColor(0xd210e8)
            .setTitle("A user has been warned")
            .setDescription(`<@${interaction.user.id}> has warned <@${moderationCommand.target.id}>\nwith the following reason:\n${inlineCode(moderationCommand.reason)}\nAdditional punishment: ${additionalPunishment}`)
            .setTimestamp()
            await addEmbedFooter(client, modlogEmbed);

        await sendModLog(client, modlogEmbed);

        await interaction.reply({
            content: `Warned <@${moderationCommand.target.id}> for ${moderationCommand.reason}`,
            ephemeral: true
        });
	},
};
