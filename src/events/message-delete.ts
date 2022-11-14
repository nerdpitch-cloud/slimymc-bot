import { EmbedBuilder, Message, PartialMessage } from "discord.js";
import { Config } from "../conf/config";

export async function handleMessageDelete(config: Config, message: Message<boolean> | PartialMessage) {
    let logChannel = await message.client.channels.fetch(config.log.userlogChannelId);
    if (!logChannel?.isTextBased()) throw new Error("logChannel is not text based");

    let channel = await message.channel.fetch()
    if(channel.isDMBased()) throw new Error("channel was DM channel")

    let logEmbed = new EmbedBuilder()
        .setColor(0xdd5e53)
        .setTitle(`Message deleted in ${channel.name}`)
        .setDescription(message.content || "no content")
        .setTimestamp()

    if (message.author) {
        logEmbed.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });
        logEmbed.setFooter( {text: `ID - ${message.author.id} `})
    }
    logChannel.send( {embeds: [logEmbed] });
}