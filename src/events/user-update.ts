import { EmbedBuilder, PartialUser, User } from "discord.js";
import { Config } from "../conf/config";

export async function handleUserUpdate(config: Config, oldUser: User | PartialUser, newUser: User) {
	let logChannel = await newUser.client.channels.fetch(config.log.userlogChannelId);
	if (!logChannel) throw new Error("logChannel was null");
	if (!logChannel.isTextBased()) throw new Error("logChannel wasn't text based");

	let LogEmbed = new EmbedBuilder()
		.setColor(0x4286f4)
		.setFooter({ text: `ID - ${newUser.id}` })
		.setAuthor({ name: `${newUser.username}#${newUser.discriminator}`, iconURL: newUser.displayAvatarURL() })
		.setTimestamp();

	if (oldUser.avatar !== newUser.avatar) {
		LogEmbed.setDescription(`<@${newUser.id}>`);
		LogEmbed.setThumbnail(newUser.avatarURL());

		logChannel.send({ embeds: [LogEmbed] });
	} else if (oldUser.username !== newUser.username || oldUser.discriminator !== newUser.discriminator) {
		let oldName = `${oldUser.username}#${oldUser.discriminator}`;
		let newName = `${newUser.username}#${newUser.discriminator}`;
		LogEmbed.setTitle("Username change");
		LogEmbed.setDescription(`**Before:** ${oldName}\n**After:** ${newName}`);

		logChannel.send({ embeds: [LogEmbed] });
	}
}
