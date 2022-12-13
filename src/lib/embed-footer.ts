import { EmbedBuilder } from "discord.js";
import SlimyClient from "../client";

export async function addEmbedFooter(client: SlimyClient, embed: EmbedBuilder) {
	if (client.user) {
		const avatar = client.user.avatarURL();
		if (avatar) {
			embed.setFooter({ text: client.user.username, iconURL: avatar });
		}
	}
}
