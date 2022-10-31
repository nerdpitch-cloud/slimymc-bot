import { EmbedBuilder, codeBlock, TextBasedChannel, ChannelType, CommandInteraction } from "discord.js";
import SlimyClient from "../../client";
import { ErrorlogChannelId } from "../../conf/log.json"
import { addEmbedFooter } from "../embed-footer";

var errorLogChannel: TextBasedChannel | null;

process.on('uncaughtException', error => {
    console.log(error);

    let errorTxt: string

    if (error.stack) {
        errorTxt = error.stack
    } else {
        errorTxt = error.name + error.message
    }

    const errorEmbed = new EmbedBuilder()
    .setColor(0xba2020)
    .setTitle("An unexpected Node error occured")
    .setDescription(`Error log:\n${codeBlock(errorTxt)}`)
    .setTimestamp()

    _sendErrorLog(errorEmbed);
})

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

export async function loadErrorLogChannel(client: SlimyClient) {
    let channel = await client.channels.fetch(ErrorlogChannelId);

    if (channel?.type == ChannelType.GuildText) {
        errorLogChannel = channel;
    }
}

export async function handleUnexpectedError(client: SlimyClient, error: any) {
    if (error !instanceof Error) return;

    let errorTxt: string
    console.log(error);

    if (error.stack) {
        errorTxt = error.stack
    } else {
        errorTxt = error.name + error.message
    }

    const errorEmbed = new EmbedBuilder()
        .setColor(0xba2020)
        .setTitle("An unexpected error occured")
        .setDescription(`Error log:\n${codeBlock(errorTxt)}`)
        .setTimestamp()
        await addEmbedFooter(client, errorEmbed)

    _sendErrorLog(errorEmbed);
}

export async function handleExpectedError(client: SlimyClient, interaction: CommandInteraction, error: string) {
    const errorEmbed = new EmbedBuilder()
    .setColor(0xba2020)
    .setTitle("An error occurred when handling your command")
    .setDescription(codeBlock(error))
    .setTimestamp()
    await addEmbedFooter(client, errorEmbed)

    _errorReply(errorEmbed, interaction);
}