import { Client, EmbedBuilder, User } from "discord.js";

export async function sendDmEmbed(client: Client, user: User, embed: EmbedBuilder) {
    await client.users.send(user.id, { embeds: [embed] })
};

export async function sendDmString(client: Client, user: User, string: string) {
    await client.users.send(user.id, string)
};