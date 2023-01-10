import { EmbedBuilder, Message, PartialMessage } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";

export async function handleMessageDelete(client: SlimyClient, config: Config, message: Message<boolean> | PartialMessage) {
	if (!message.content || message.author == client.user) return;

	const ingnoredChannels = [config.counting.channelId];
	const logChannel = await message.client.channels.fetch(config.log.userlogChannelId);

	if (!logChannel?.isTextBased()) throw new Error("logChannel is not text based");

	if (ingnoredChannels.includes(message.channel.id)) return;

	const channel = await message.channel.fetch();
	if (channel.isDMBased()) return;
	const logEmbed = new EmbedBuilder()
		.setColor(0xdd5e53)
		.setTitle(`Message deleted in ${channel.name}`)
		.setDescription(message.content || "no content")
		.setTimestamp();

	if (message.author) {
		logEmbed.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });
		logEmbed.setFooter({ text: `ID - ${message.author.id} ` });
	}

	logChannel.send({ embeds: [logEmbed] });
}
