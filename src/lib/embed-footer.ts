import { Client, EmbedBuilder } from "discord.js";
import SlimyClient from "../client";

export async function addEmbedFooter(client: SlimyClient | Client, embed: EmbedBuilder) {
    if (client.user) {
        let avatar = client.user.avatarURL()
        if (avatar) {
            embed.setFooter({ text: client.user.username, iconURL: avatar});
        }
    }
}