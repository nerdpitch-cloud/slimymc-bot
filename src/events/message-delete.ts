import { EmbedBuilder, Message, PartialMessage } from "discord.js";
import { UserlogChannelId } from "../conf/log.json"

export async function handleMessageDelete(message: Message<boolean> | PartialMessage) {
    let logChannel = await message.client.channels.fetch(UserlogChannelId);
    if (!logChannel?.isTextBased()) throw new Error("logChannel is not text based");

    let channel = await message.channel.fetch()
    if(channel.isDMBased()) throw new Error("channel was DM channel")

    let logEmbed = new EmbedBuilder()
        .setColor(0xdd5e53)
        .setTitle(`Message deleted in ${channel.name}`)
        .setDescription(message.content)
        .setTimestamp()

    if (message.author) {
        logEmbed.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });
        logEmbed.setFooter( {text: `ID - ${message.author.id} `})
    }
    logChannel.send( {embeds: [logEmbed] });
}