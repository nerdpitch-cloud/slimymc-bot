import { ChannelType, Client, EmbedBuilder, Message } from "discord.js";
import { Config } from "../../conf/config";

export async function sendModLog(client: Client, config: Config, embed: EmbedBuilder): Promise<Message | void> {
	const modlogChannel = await client.channels.fetch(config.log.modlogChannelId);

	if (modlogChannel) {
		if (modlogChannel.type == ChannelType.GuildText) {
			await modlogChannel.send({ embeds: [embed] });
		}
	}
}
