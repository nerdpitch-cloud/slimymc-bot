import { SlashCommandBuilder, PermissionFlagsBits, CommandInteraction, EmbedBuilder, inlineCode } from "discord.js";
import SlimyClient from "../client";
import { addEmbedFooter } from "../lib/embed-footer";
import { cannotPunish, ModerationAction } from "../lib/errors/common/permissions";
import { handleUnexpectedError } from "../lib/errors/handler";
import { moderationSetup } from "../lib/moderation/moderation";
import { sendModLog } from "../lib/moderation/modlog";
import { sendDmEmbed } from "../lib/moderation/send-dm";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("tempmute")
		.setDescription("tempmute a user")
		.addUserOption((option) =>
			option
				.setName("target")
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

	async execute(client: SlimyClient, interaction: CommandInteraction) {
        let moderationCommand = await moderationSetup(client, interaction, ModerationAction.TEMPMUTE)
        if(!moderationCommand) throw new Error(`moderationCommand was null`);
        if(!moderationCommand.duration) throw new Error(`moderationCommand.duration was null/undefined`);

        let memberTarget = await moderationCommand.guild.members.fetch(moderationCommand.target.id)

        await memberTarget.timeout(moderationCommand.duration * 60  * 60 * 1000);

        let tempmuteEmbed = new EmbedBuilder()
        .setColor(0xbb2525)
        .setTitle("You have been temporarily muted")
        .setDescription(`You have been temporarily muted by **${interaction.user.username}#${interaction.user.discriminator}** on **${moderationCommand.guild.name}**\nfor the duration of **${moderationCommand.duration} hours**\nfor: ${inlineCode(moderationCommand.reason)}`)
        .setTimestamp()
        await addEmbedFooter(client, tempmuteEmbed);

        await sendDmEmbed(client, moderationCommand.target, tempmuteEmbed);

        let modlogEmbed = new EmbedBuilder()
            .setColor(0x2ab0a7)
            .setTitle("A user has temporarily muted")
            .setDescription(`<@${interaction.user.id}> has temporarily muted <@${moderationCommand.target.id}>\nfor **${moderationCommand.duration} hours**\nwith the following reason:\n${inlineCode(moderationCommand.reason)}`)
            .setTimestamp()
            await addEmbedFooter(client, modlogEmbed);

        await sendModLog(client, modlogEmbed)

        await interaction.reply({
            content: `temporarily muted <@${moderationCommand.target.id}> for ${moderationCommand.reason}`,
            ephemeral: true
        });
    }
}
