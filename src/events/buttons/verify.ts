import { ButtonStyle, EmbedBuilder, TextBasedChannel, ButtonBuilder, ActionRowBuilder, ButtonInteraction, TextChannel } from "discord.js";
import SlimyClient from "../../client";
import { addEmbedFooter } from "../../lib/embed-footer";
import { Config } from "../../conf/config";

const verifyEmbed = new EmbedBuilder().setColor(0xabf243).setTitle("Verification").setDescription("Click the button below to verify");

export async function checkVerifyMessage(client: SlimyClient, config: Config) {
	if (!config.verify.verifyMessageId) {
		const channel = await client.channels.fetch(config.verify.verifyChannelId);
		if (channel instanceof TextChannel) {
			channel.bulkDelete(100);
			_sendVerifyMessage(client, config, channel);
		}
	}
}

async function _sendVerifyMessage(client: SlimyClient, config: Config, channel: TextBasedChannel) {
	await addEmbedFooter(client, verifyEmbed);

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId("verify").setEmoji("📩").setLabel("Click to verify!").setStyle(ButtonStyle.Primary)
	);

	const message = await channel.send({ embeds: [verifyEmbed], components: [actionRow] });

	const conf = JSON.stringify(
		{
			verifyChannelId: config.verify.verifyChannelId,
			verifyMessageId: message.id,
		},
		null,
		4
	);
}

export async function handleVerifyButton(interaction: ButtonInteraction, config: Config) {
	const member = await interaction.guild?.members.fetch(interaction.user.id);

	if (member) {
		if (member.roles.cache.some((role) => role.id === config.verify.verifyRoleId)) {
			interaction.reply({
				content: `You are already verified!`,
				ephemeral: true,
			});
		} else {
			member.roles.add(config.verify.verifyRoleId);
			interaction.reply({
				content: `Verified successfully, take a look at <#${config.verify.recommendedChannels[0]}> & <#${config.verify.recommendedChannels[1]}>`,
				ephemeral: true,
			});
		}
	}
}
