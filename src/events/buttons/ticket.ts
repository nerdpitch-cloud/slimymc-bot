import { ButtonStyle, EmbedBuilder, TextBasedChannel, ButtonBuilder, ActionRowBuilder, ButtonInteraction, TextChannel, bold, CategoryChannel, Collection, ChannelType, PermissionsBitField, inlineCode } from "discord.js";
import SlimyClient from "../../client"
import { addEmbedFooter } from "../../lib/embed-footer";
import { createTranscript } from "discord-html-transcripts";
import { Config } from "../../conf/config";


export async function checkTicketMessage(client: SlimyClient, config: Config) {
    let channel = client.channels.cache.get(config.tickets.createChannelId) as TextBasedChannel;

    if (config.tickets.createMessageId) {
        let message = await channel.messages.fetch(config.tickets.createMessageId);

        if (message) {
            return;
        }
    }

    await sendCreateTicketMessage(client, config);
}

async function sendCreateTicketMessage(client: SlimyClient, config: Config) {
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

    let ticketMessage = await channel.send({ embeds: [verifyEmbed], components: [actionRow] });

    console.log(`Created ticket message - ${ticketMessage.id}`);

}

export async function handleCreateTicketButton(interaction: ButtonInteraction, config: Config) {
    let ticketCategory = interaction.client.channels.cache.get(config.tickets.categoryId) as CategoryChannel;

    let categoryChannels = interaction.guild?.channels.cache.filter(channel => channel.parentId === ticketCategory.id) as Collection<string, TextChannel>;
    let userTicketChannel = categoryChannels?.find(channel => channel.topic?.includes(interaction.user.id));

    if (userTicketChannel) {
        interaction.reply({
            content: `You already have a ticket open!`,
            ephemeral: true
        });

        return;
    }

    let ticketChannel = await interaction.guild?.channels.create({
        name: `${interaction.component.emoji?.name}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: ticketCategory,
        topic: `Ticket for ${interaction.user.tag} (${interaction.user.id})`,
        permissionOverwrites: [
            {
                id: interaction.guild?.id,
                deny: ["ViewChannel"]
            },
            {
                id: interaction.user.id,
                allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
            },
            {
                id: config.tickets.supportRoleId,
                allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
            }
        ]
    });

    let welcomeEmbed = new EmbedBuilder()
        .setColor(0x77b94d)
        .setTitle(`Ticket of  ${interaction.user.tag}`)
        .setDescription(`${bold("Please describe your issue in as much detail as possible.")}`)
    await addEmbedFooter(interaction.client, welcomeEmbed);

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("claim_ticket")
                .setEmoji("👤")
                .setLabel("Claim")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("close_ticket")
                .setEmoji("🔒")
                .setLabel("Close")
                .setStyle(ButtonStyle.Secondary),
        );

    await ticketChannel?.send({ embeds: [welcomeEmbed], components: [actionRow] });

    interaction.reply({
        content: `Your ticket has been created!\nYou can view it here: <#${ticketChannel?.id}>`,
        ephemeral: true
    });
}

export async function handleClaimTicketButton(interaction: ButtonInteraction, config: Config) {

    let ticketChannel = interaction.channel as TextChannel;
    let member = await interaction.guild?.members.fetch(interaction.user.id);
    let guild = await interaction.guild?.fetch();

    if (!member || !guild) return;

    if (!member.roles.cache.has(config.tickets.supportRoleId)) {
        interaction.reply({
            content: `You don't have the support role to to able to claim tickets!`,
            ephemeral: true
        });

        return;
    }

    if (ticketChannel.topic?.includes("claimed by")) {
        interaction.reply({
            content: `This ticket is already claimed!`,
            ephemeral: true
        });

        return;
    }

    await ticketChannel.edit({
        permissionOverwrites: [
            {
                id: guild.id,
                deny: ["ViewChannel"]
            },
            {
                id: interaction.user.id,
                allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
            },
            {
                id: config.tickets.supportRoleId,
                deny: ["ViewChannel", "SendMessages", "ReadMessageHistory"]
            }
        ]
    });

    await ticketChannel.setTopic(`Ticket for ${interaction.user.tag} (${interaction.user.id}) claimed by ${interaction.user.tag} (${interaction.user.id})`);

    await ticketChannel.send({
        content: `Ticket claimed by <@${interaction.user.id}>`
    });

    interaction.deferUpdate();

}

export async function handleCloseTicketButton(interaction: ButtonInteraction, config: Config) {

    let ticketChannel = interaction.channel as TextChannel;
    await ticketChannel.fetch()
    let member = await interaction.guild?.members.fetch(interaction.user.id);
    let guild = await interaction.guild?.fetch();

    if (!member || !guild) return;

    if (!member.roles.cache.has(config.tickets.supportRoleId)) {
        interaction.reply({
            content: `You don't have the support role to be able to close tickets!`,
            ephemeral: true
        });

        return;
    }

    let transcript = await createTranscript(ticketChannel);

    let ticketCreatorId = ticketChannel.topic?.split(" ")[3].replace("(", "").replace(")", "");

    let ticketClaimerId = "none";
    if (ticketChannel.topic?.includes("claimed by")) {
        ticketClaimerId = ticketChannel.topic?.split(" ")[7].replace("(", "").replace(")", "");
    }

    let ticketLogEmbed = new EmbedBuilder()
        .setColor(0x77b94d)
        .setTitle(`Ticket ${ticketChannel.name} closed`)
        .addFields(
            { name: "Created by", value: `<@${ticketCreatorId}> (${ticketCreatorId})` },
            { name: "Claimed by", value: `<@${ticketClaimerId}> (${ticketClaimerId})` },
            { name: "Closed by", value: `<@${interaction.user.id}> (${interaction.user.id})` }
        )
        .setTimestamp()
        await addEmbedFooter(interaction.client, ticketLogEmbed);

    let ticketLogChannel = interaction.client.channels.cache.get(config.log.ticketLogsId) as TextChannel;
    await ticketLogChannel?.send({ embeds: [ticketLogEmbed] });

    
    interaction.deferUpdate();
    //await ticketChannel.delete();
}