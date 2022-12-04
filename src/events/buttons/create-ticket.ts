import { ButtonStyle, EmbedBuilder, TextBasedChannel, ButtonBuilder, ActionRowBuilder, ButtonInteraction, TextChannel, bold, CategoryChannel } from "discord.js";
import SlimyClient from "../../client"
import { addEmbedFooter } from "../../lib/embed-footer";
import { Config } from "../../conf/config";


export async function sendCreateTicketMessage(client: SlimyClient, config: Config) {
    let channel = client.channels.cache.get(config.tickets.createChannelId) as TextBasedChannel;

    let verifyEmbed = new EmbedBuilder()
        .setColor(0x77b94d)
        .setTitle("Create a ticket")
        .setDescription(`${bold("To create a ticket, click the appropriate button below.")}`)
        await addEmbedFooter(client, verifyEmbed);

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("create_ticket_bug")
                .setEmoji("📝")
                .setLabel("Report a bug or a player")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("create_ticket_website")
                .setEmoji("🌐")
                .setLabel("Website & Payment")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("create_ticket_other")
                .setEmoji("🤔")
                .setLabel("Other issues")
                .setStyle(ButtonStyle.Secondary),
        );

    //await channel.send({ embeds: [verifyEmbed], components: [actionRow] });

}

export async function handleCreateTicketButton(interaction: ButtonInteraction, config: Config) {
    // get all channels in category
    let category = interaction.client.channels.cache.get(config.tickets.categoryId) as CategoryChannel;

    let channels = category.children;
}