import { EmbedBuilder, GuildMember, PartialGuildMember, time } from "discord.js";
import SlimyClient from "../../client";
import { InviteLogsId } from "../../conf/log.json"

export async function handleMemberRemove(client: SlimyClient, member: GuildMember | PartialGuildMember) {
    let inviteLogChannel = await member.guild.channels.fetch(InviteLogsId);
    if (!inviteLogChannel?.isTextBased()) throw new Error ("inviteLogChannel was not text based") ;

    let joinedAt
    if (!member.joinedAt) {
        joinedAt = null
    } else {
        joinedAt = time(member.joinedAt, "F")
    }

    let inviteLogEmbed = new EmbedBuilder()
        .setColor(0xfff6af)
        .setTitle("Member left")
        .setAuthor( {name: member.user.tag, iconURL: member.displayAvatarURL()} )
        .setDescription(`<@${member.id}> joined at ${joinedAt}\nWe now have we now have **${member.guild.memberCount}** members!\nRoles: ${member.roles}`)
        .setTimestamp()
        .setFooter( {text: `ID - ${member.user.id}`})

    
    await inviteLogChannel.send({ embeds: [inviteLogEmbed] })
}