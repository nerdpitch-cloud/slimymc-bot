import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, inlineCode, CommandInteraction, User } from "discord.js";
import { sendDmEmbed } from "../lib/moderation/send-dm";
import { sendModLog } from "../lib/moderation/modlog";
import SlimyClient from "../client";
import { addEmbedFooter } from "../lib/embed-footer";
import { moderationSetup } from "../lib/moderation/moderation";
import { ModerationAction } from "../lib/moderation/moderation";
import { InfractionsDB } from "../lib/mysql/infractions";
import { handleUnexpectedError } from "../lib/errors/handler";

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
        await memberTarget.timeout(30 * 60000);

        let warnEmbed = new EmbedBuilder()
            .setColor(0xbb2525)
            .setTitle("You have been warned")
            .setDescription(`You have been warned by **${interaction.user.username}#${interaction.user.discriminator}** in **${moderationCommand.guild.name}** for: ${inlineCode(moderationCommand.reason)}`)
            .setTimestamp()
            await addEmbedFooter(client, warnEmbed);

        await sendDmEmbed(client, moderationCommand.target, warnEmbed);

        let modlogEmbed = new EmbedBuilder()
            .setColor(0xd210e8)
            .setTitle("A user has been warned")
            .setDescription(`<@${interaction.user.id}> has warned <@${moderationCommand.target.id}>\nwith the following reason:\n${inlineCode(moderationCommand.reason)}`)
            .setTimestamp()
            await addEmbedFooter(client, modlogEmbed);

        await sendModLog(client, modlogEmbed);

        await interaction.reply({
            content: `Warned <@${moderationCommand.target.id}> for ${moderationCommand.reason}`,
            ephemeral: true
        });

        let allInfractions = await InfractionsDB.getInfractions(moderationCommand.target.id)
        if (allInfractions.result.length >= 5) {
            let memberTarget = await moderationCommand.guild.members.fetch(moderationCommand.target.id)
            await memberTarget.timeout( 30 * 60000, moderationCommand.reason);
        }
	},
};
