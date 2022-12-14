import { EmbedBuilder, codeBlock, TextBasedChannel, ChannelType, CommandInteraction } from "discord.js";
import SlimyClient from "../../client";
import { Config } from "../../conf/config";
import { addEmbedFooter } from "../embed-footer";

let errorLogChannel: TextBasedChannel | null;

process.on("uncaughtException", (error) => {
	console.log(error);

	let errorTxt: string;

	if (error.stack) {
		errorTxt = error.stack;
	} else {
		errorTxt = error.name + error.message;
	}
	const errorEmbed = new EmbedBuilder()
		.setColor(0xba2020)
		.setTitle("An unexpected Node error occured")
		.setDescription(`Error log:\n${codeBlock(errorTxt)}`)
		.setTimestamp();

	_sendErrorLog(errorEmbed);
});

async function _sendErrorLog(embed: EmbedBuilder) {
	if (errorLogChannel) {
		errorLogChannel.send({ embeds: [embed] });
	}
}

async function _errorReply(embed: EmbedBuilder, interaction: CommandInteraction) {
	interaction.reply({
		embeds: [embed],
		ephemeral: true,
	});
}

export async function loadErrorLogChannel(client: SlimyClient, config: Config) {
	const channel = await client.channels.fetch(config.log.errorlogChannelId);

	if (channel?.type == ChannelType.GuildText) {
		errorLogChannel = channel;
	}
}

export async function handleUnexpectedError(client: SlimyClient, error: any) {
	console.log(error);

	let errorTxt: string;

	if (error.stack) {
		errorTxt = error.stack;
	} else {
		errorTxt = error.name + error.message;
	}

	const errorEmbed = new EmbedBuilder()
		.setColor(0xba2020)
		.setTitle("An unexpected error occured")
		.setDescription(`Error log:\n${codeBlock(errorTxt)}`)
		.setTimestamp();
	await addEmbedFooter(client, errorEmbed);

	_sendErrorLog(errorEmbed);
}

export async function handleExpectedError(client: SlimyClient, interaction: CommandInteraction, error: string) {
	const errorEmbed = new EmbedBuilder()
		.setColor(0xba2020)
		.setTitle("An error occurred when handling your command")
		.setDescription(codeBlock(error))
		.setTimestamp();
	await addEmbedFooter(client, errorEmbed);

	_errorReply(errorEmbed, interaction);
}
