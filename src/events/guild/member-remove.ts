import { EmbedBuilder, GuildMember, PartialGuildMember, time } from "discord.js";
import { InviteLogsId } from "../../conf/log.json"
import { InvitesDB } from "../../lib/mysql/invites";

export async function handleMemberRemove(member: GuildMember | PartialGuildMember) {
    let inviteLogChannel = await member.guild.channels.fetch(InviteLogsId);
    if (!inviteLogChannel?.isTextBased()) throw new Error ("inviteLogChannel was not text based") ;

    let joinedAt
    if (!member.joinedAt) {
        joinedAt = null
    } else {
        joinedAt = time(member.joinedAt, "F")
    }

    let memberRoles = member.roles.cache.map(role => role.id)

    let rolesMention = "";
    for (let i = 0; i < memberRoles.length; i++) {
        if (memberRoles[i] !== member.guild.roles.everyone.id) {
            rolesMention += `<@&${memberRoles[i]}> `
        }
    }

    await InvitesDB.removeInvite(member.id);

    let inviteLogEmbed = new EmbedBuilder()
        .setColor(0xfff6af)
        .setTitle("Member left")
        .setAuthor( {name: member.user.tag, iconURL: member.displayAvatarURL()} )
        .setDescription(`<@${member.id}> joined at ${joinedAt}\nWe now have **${member.guild.memberCount}** members!\nRoles: ${rolesMention}`)
        .setTimestamp()
        .setFooter( {text: `ID - ${member.user.id}`})

    
    await inviteLogChannel.send({ embeds: [inviteLogEmbed] })
}