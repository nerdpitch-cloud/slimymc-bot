import { Client, EmbedBuilder, Message, User } from "discord.js";

export async function sendDmEmbed(client: Client, user: User, embed: EmbedBuilder): Promise<Message> {
    return await client.users.send(user.id, { embeds: [embed] })
};

export async function sendDmString(client: Client, user: User, string: string): Promise<Message> {
    return await client.users.send(user.id, string)
};