import {
	ButtonStyle,
	EmbedBuilder,
	TextBasedChannel,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonInteraction,
	TextChannel,
	bold,
	CategoryChannel,
	Collection,
	ChannelType,
	italic,
} from "discord.js";
import SlimyClient from "../../client";
import { addEmbedFooter } from "../../lib/embed-footer";
import { createTranscript } from "discord-html-transcripts";
import { Config } from "../../conf/config";
import { sendDM } from "../../lib/moderation/send-dm";

export async function checkTicketMessage(client: SlimyClient, config: Config) {
	let channel = client.channels.cache.get(
		config.tickets.createChannelId
	) as TextBasedChannel;

	if (config.tickets.createMessageId) {
		let message = await channel.messages.fetch(
			config.tickets.createMessageId
		);

		if (message) {
			return;
		}
	}

	await sendCreateTicketMessage(client, config);
}

async function sendCreateTicketMessage(client: SlimyClient, config: Config) {
	let channel = client.channels.cache.get(
		config.tickets.createChannelId
	) as TextBasedChannel;

	let verifyEmbed = new EmbedBuilder()
		.setColor(0x77b94d)
		.setTitle("Create a ticket")
		.setDescription(
			`
        Opening a ticket creates a private channel for you to talk with staff.
        Only open a ticket if you are experiencing any of these issues:

        🕵️ **Reports**
        - Report a player (In-game or Discord)
        - Report a bug found on Discord or Minecraft.

        💵 **Store**
        - Report a bug found on the website.
        - Issues related to Payment or Security.

        📋 **Applications**
        - We are not accepting applications as of now.

        ✍️ **Other issues**
        - If you are in need of talking to staff about another issue or question.

        `
		)
		.setTimestamp();

	await addEmbedFooter(client, verifyEmbed);

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId("create_ticket_report")
			.setEmoji("🕵️")
			.setLabel("Reports")
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId("create_ticket_store")
			.setEmoji("💵")
			.setLabel("Store")
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId("create_ticket_applications")
			.setEmoji("📋")
			.setLabel("Applications")
			.setStyle(ButtonStyle.Secondary),

		new ButtonBuilder()
			.setCustomId("create_ticket_other")
			.setEmoji("✍️")
			.setLabel("Other issues")
			.setStyle(ButtonStyle.Secondary)
	);


	let ticketMessage = await channel.send({

		embeds: [verifyEmbed],
		components: [actionRow],
	});

	console.log(`Created ticket message - ${ticketMessage.id}`);
}

export async function handleCreateTicketButton(
	interaction: ButtonInteraction,
	config: Config
) {

	let ticketType = interaction.customId.replace("create_ticket_", "");


	if (ticketType === "applications") {
		interaction.reply({
			content: `We are currently not accepting any applications.`,
			ephemeral: true,
		});
		return;
	}
  
	let ticketCategory = interaction.client.channels.cache.get(
		config.tickets.categoryId
	) as CategoryChannel;

	let categoryChannels = interaction.guild?.channels.cache.filter(
		(channel) => channel.parentId === ticketCategory.id
	) as Collection<string, TextChannel>;
	let userTicketChannel = categoryChannels?.find((channel) =>
		channel.topic?.includes(interaction.user.id)
	);

	if (userTicketChannel) {
		interaction.reply({
			content: `You already have a ticket open!`,
			ephemeral: true,
		});

		return;
	}

	let overwrites: any[] = [];

	overwrites.push(
		{
			id: interaction.guild?.id,
			deny: ["ViewChannel"],
		},
		{
			id: interaction.user.id,
			allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
		},
		{
			id: config.modroles.srModeratorId,
			allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
		}
	);

	if (ticketType === "report" || ticketType === "other") {
		overwrites.push(
			{
				id: config.modroles.helperId,
				allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
			},
			{
				id: config.modroles.moderatorId,
				allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
			}
		);
	}

	let ticketChannel = await interaction.guild?.channels.create({

		name: `${interaction.component.emoji?.name}-${interaction.user.username}`,
		type: ChannelType.GuildText,
		parent: ticketCategory,
		topic: `Ticket for ${interaction.user.tag} (${interaction.user.id})`,
		permissionOverwrites: [
			{
				id: interaction.guild?.id,
				deny: ["ViewChannel"],
			},
			{
				id: interaction.user.id,
				allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
			},
			{
				id: config.tickets.supportRoleId,
				allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
			},
		],
	});

	let embedDescription = "";
	switch (ticketType) {
		case "report":
			embedDescription = `Thank you for taking the time to report a rule-breaker!
			Please let us know the following while staff is on their way:
			- Who are you trying to report? (IGN or Discord name and tag)
			- Do you have any evidence? if so, please send it here.`;
			break;
		case "store":
			embedDescription = `This ticket is for reports and questions related to our store and website.
			While support is on their way, please let us know how we can help.`;
			break;
		case "other":
			embedDescription = `Hello player, we are here to assist you with any problems or questions you might have, feel free to describe them as we make our way to this ticket.`;
	}

	let welcomeEmbed = new EmbedBuilder()

		.setColor(0x77b94d)
		.setTitle(`Ticket of  ${interaction.user.tag}`)
		.setDescription(embedDescription)
		.setTimestamp();
	await addEmbedFooter(interaction.client, welcomeEmbed);

	let actionRow = new ActionRowBuilder<ButtonBuilder>();

	if (
		interaction.customId === "create_ticket_report" ||
		interaction.customId === "create_ticket_other"
	) {
		actionRow.addComponents(
			new ButtonBuilder()
				.setCustomId("claim_ticket")
				.setEmoji("👤")
				.setLabel("Claim")
				.setStyle(ButtonStyle.Secondary)
		);
	}

	actionRow.addComponents(
		new ButtonBuilder()
			.setCustomId("close_ticket")
			.setEmoji("🔒")
			.setLabel("Close")
			.setStyle(ButtonStyle.Secondary)
	);

	await ticketChannel?.send({
		embeds: [welcomeEmbed],
		components: [actionRow],
	});

	interaction.reply({
		content: `Your ticket has been created!\nYou can view it here: <#${ticketChannel?.id}>`,
		ephemeral: true,
	});
}

export async function handleClaimTicketButton(
	interaction: ButtonInteraction,
	config: Config
) {

	let ticketChannel = interaction.channel as TextChannel;
	let member = await interaction.guild?.members.fetch(interaction.user.id);
	let guild = await interaction.guild?.fetch();

	if (!member || !guild) return;

	if (!member.roles.cache.has(config.tickets.supportRoleId)) {
		interaction.reply({
			content: `You don't have the support role to to able to claim tickets!`,
			ephemeral: true,
		});

		return;
	}

	if (ticketChannel.topic?.includes("claimed by")) {
		interaction.reply({
			content: `This ticket is already claimed!`,
			ephemeral: true,
		});

		return;
	}

	await ticketChannel.edit({
		permissionOverwrites: [
			{
				id: guild.id,
				deny: ["ViewChannel"],
			},
			{
				id: interaction.user.id,
				allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
			},
			{
				id: config.tickets.supportRoleId,
				deny: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
			},
		],
	});

	await ticketChannel.setTopic(
		`Ticket for ${interaction.user.tag} (${interaction.user.id}) claimed by ${interaction.user.tag} (${interaction.user.id})`
	);

	await ticketChannel.send({
		content: `Ticket claimed by <@${interaction.user.id}>`,
	});

	interaction.deferUpdate();
}

export async function handleCloseTicketButton(
	interaction: ButtonInteraction,
	config: Config
) {

	let ticketChannel = interaction.channel as TextChannel;
	await ticketChannel.fetch();
	let member = await interaction.guild?.members.fetch(interaction.user.id);
	let guild = await interaction.guild?.fetch();

	if (!member || !guild) return;

	if (!member.roles.cache.has(config.tickets.supportRoleId)) {
		interaction.reply({
			content: `You don't have the support role to be able to close tickets!`,
			ephemeral: true,
		});

		return;
	}

	let transcript = await createTranscript(ticketChannel);

	let ticketCreatorId = ticketChannel.topic

		?.split(" ")[3]
		.replace("(", "")
		.replace(")", "");
	if (!ticketCreatorId) return;

	let ticketClaimerId = "none";
	if (ticketChannel.topic?.includes("claimed by")) {
		ticketClaimerId = ticketChannel.topic
			?.split(" ")[7]
			.replace("(", "")
			.replace(")", "");
	}

	let ticketLogEmbed = new EmbedBuilder()

		.setColor(0x77b94d)
		.setTitle(`Ticket ${ticketChannel.name} closed`)
		.setDescription(
			italic(
				"To view the transcript, download the file above and open it in a web browser."
			)
		)
		.addFields(
			{
				name: "Category",
				value: ticketChannel.parent?.name || "none",
			},
			{
				name: "Created by",
				value: `<@${ticketCreatorId}> (${ticketCreatorId})`,
			},
			{
				name: "Claimed by",
				value: `<@${ticketClaimerId}> (${ticketClaimerId})`,
			},
			{
				name: "Closed by",
				value: `<@${interaction.user.id}> (${interaction.user.id})`,
			}
		)
		.setTimestamp();
	await addEmbedFooter(interaction.client, ticketLogEmbed);

	let ticketLogChannel = interaction.client.channels.cache.get(
		config.log.ticketLogsId
	) as TextChannel;

	let ticketCreator = await interaction.client.users.fetch(ticketCreatorId);

	await ticketLogChannel?.send({
		embeds: [ticketLogEmbed],
		files: [transcript],
	});
	await sendDM(interaction.client, ticketCreator, {
		embeds: [ticketLogEmbed],
		files: [transcript],
	});

	interaction.deferUpdate();

	await ticketChannel.delete();
}
