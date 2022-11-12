import { EmbedBuilder, Message, PartialMessage } from "discord.js";
import { UserlogChannelId } from "../conf/log.json"

export async function handleMessageUpdate(oldMessage: Message<boolean> | PartialMessage, newMessage: Message<boolean> | PartialMessage) {
    if (oldMessage.content === newMessage.content) return;
    
    let logChannel = await oldMessage.client.channels.fetch(UserlogChannelId);
    if (!logChannel?.isTextBased()) throw new Error("logChannel is not text based");
    if (!newMessage.author) throw new Error("newMessage.author was null")

    let channel = await newMessage.channel.fetch()
    if(channel.isDMBased()) throw new Error("channel was DM channel")
    
    let logEmbed = new EmbedBuilder()
        .setColor(0x4286f4)
        .setAuthor({ name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL() })
        .setTitle(`Message edited in ${channel.name}`)
        .setDescription(`**Before:** ${oldMessage.content}\n**After:** ${newMessage.content}`)
        .setTimestamp()
        .setFooter( {text: `ID - ${newMessage.author.id} `})

    logChannel.send( {embeds: [logEmbed] });
}