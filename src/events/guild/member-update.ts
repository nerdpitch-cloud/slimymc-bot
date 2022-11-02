import { EmbedBuilder, GuildMember, PartialGuildMember } from "discord.js";
import { UserlogChannelId } from "../../conf/log.json"

export async function handleGuildMemberUpdate(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
    let logChannel = await newMember.client.channels.fetch(UserlogChannelId);
    if (!logChannel) throw new Error("logChannel was null");
    if (!logChannel.isTextBased()) throw new Error("logChannel wasn't text based ");


    let LogEmbed = new EmbedBuilder()
        .setColor(0x4286f4)
        .setFooter({ text: `ID - ${newMember.id}` })
        .setAuthor({ name: `${newMember.user.username}#${newMember.user.discriminator}`, iconURL: newMember.displayAvatarURL()})
        .setTimestamp()

    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        oldMember.roles.cache.forEach(role => {
            if (!newMember.roles.cache.has(role.id)) {
                LogEmbed.setTitle("Role removed")
                LogEmbed.setDescription(`<@&${role.id}>`)
            }
        });

        logChannel.send({ embeds: [LogEmbed]} );

    } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        newMember.roles.cache.forEach(role => {
            if (!oldMember.roles.cache.has(role.id)) {
                LogEmbed.setTitle("Role added")
                LogEmbed.setDescription(`<@&${role.id}>`)
            }
        });

        logChannel.send({ embeds: [LogEmbed]} );

    } else if (oldMember.nickname !== newMember.nickname) {
        LogEmbed.setTitle("Nichname change")
        LogEmbed.setDescription(`**Before:** ${oldMember.nickname}\n**After:** ${newMember.nickname}`)
        
        logChannel.send({ embeds: [LogEmbed] });

    } else if (oldMember.avatar !== newMember.avatar) {
        LogEmbed.setTitle("Member avatar update")
        LogEmbed.setDescription(`<@${newMember.id}>`)
        LogEmbed.setThumbnail(newMember.avatarURL())
        
        logChannel.send({ embeds: [LogEmbed] });

    }
}