import { EmbedBuilder, GuildMember, PartialGuildMember, time } from "discord.js";
import { Config } from "../../conf/config";
import { InvitesDB } from "../../lib/mysql/invites";

export async function handleMemberRemove(config: Config, member: GuildMember | PartialGuildMember) {
	const inviteLogChannel = await member.guild.channels.fetch(config.log.inviteLogsId);
	if (!inviteLogChannel?.isTextBased()) throw new Error("inviteLogChannel was not text based");

	let joinedAt;
	if (!member.joinedAt) {
		joinedAt = null;
	} else {
		joinedAt = time(member.joinedAt, "F");
	}

	const memberRoles = member.roles.cache.map((role) => role.id);

	let rolesMention = "";
	for (let i = 0; i < memberRoles.length; i++) {
		if (memberRoles[i] !== member.guild.roles.everyone.id) {
			rolesMention += `<@&${memberRoles[i]}> `;
		}
	}

	await InvitesDB.removeInvite(member.id);

	const inviteLogEmbed = new EmbedBuilder()
		.setColor(0xdb4d40)
		.setTitle("Member left")
		.setAuthor({ name: member.user.tag, iconURL: member.displayAvatarURL() })
		.setDescription(`<@${member.id}> joined at ${joinedAt}\nWe now have **${member.guild.memberCount}** members!\nRoles: ${rolesMention}`)
		.setTimestamp()
		.setFooter({ text: `ID - ${member.user.id}` });

	await inviteLogChannel.send({ embeds: [inviteLogEmbed] });
}
