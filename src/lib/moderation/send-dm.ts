import { Client, EmbedBuilder, Message, MessageCreateOptions, MessagePayload, User } from "discord.js";

export async function sendDmEmbed(client: Client, user: User, embed: EmbedBuilder): Promise<Message | null> {
	try {
		return await client.users.send(user.id, { embeds: [embed] });
	} catch (err) {
		return null;
	}
}

export async function sendDmString(client: Client, user: User, string: string): Promise<Message> {
    return await client.users.send(user.id, string)
}

export async function sendDM(client: Client, user: User, message: string | MessagePayload | MessageCreateOptions) {
    return await client.users.send(user.id, message)
}