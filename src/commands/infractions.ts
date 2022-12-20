import {
	time,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	SelectMenuBuilder,
	SelectMenuComponentOptionData,
	PermissionFlagsBits,
} from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { convertUTCDateToLocalDate } from "../lib/date";
import { addEmbedFooter } from "../lib/embed-footer";
import { punishmentTextFromId } from "../lib/moderation/moderation";
import { InfractionsDB } from "../lib/mysql/infractions";
import { Command } from "./_handle";


export class InfractionsCommand implements Command {
	name = "🔨 Infractions";
	description = "View/Manage member's infractions";
	syntax = "infractions <view|remove>";
	subCommands = [
		{
			name: "view",
			description: "View member's infractions",
			syntax: "infractions view <member>",
			
		},
		{
			name: "remove",
			description: "Remove member's infraction from the database",
			syntax: "infractions remove <member>",
		},
	];

	data = new SlashCommandBuilder()
		.setName("infractions")
		.setDescription("View/Manage member's infractions")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("view")
				.setDescription("View member's infractions")
				.addUserOption((option) => option
					.setName("member")
					.setDescription("Member who's history of infractions you want to view")
					.setRequired(true)
				)
		)

		.addSubcommand((subcommand) =>
		subcommand
			.setName("remove")
			.setDescription("Remove member's infraction from the database")
			.addUserOption((option) => option
				.setName("member")
				.setDescription("Member who's infraction you want to remove")
				.setRequired(true))
		)

		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false);


	async execute(client: SlimyClient, config: Config, interaction: ChatInputCommandInteraction) {
		const subCommand = interaction.options.getSubcommand();

		const target = interaction.options.getUser("member");
		if (!target) throw new Error("target was null");

		if (subCommand == "view") {
			const allInfractions = await InfractionsDB.getAllInfractions(target.id);

			let infractionsSrc = "";

			const infractionsEmbed = new EmbedBuilder().setColor(0x3075ff).setTitle("View infractions").setTimestamp();
			await addEmbedFooter(client, infractionsEmbed);

			for (let i = 0; i < allInfractions.length; i++) {
				const curr = allInfractions[i];
				const date_issued = await convertUTCDateToLocalDate(curr.date_issued);

				const punishmentStr = await punishmentTextFromId(curr.punishment);
				infractionsSrc += `**${punishmentStr.charAt(0).toUpperCase() + punishmentStr.slice(1)}** - ${time(date_issued, "F")} - ${
					curr.reason
				}\n`;
			}

			infractionsEmbed.setDescription(`Infractions of <@${target.id}>\n\n${infractionsSrc}`);

			interaction.reply({ embeds: [infractionsEmbed] });
		} else if (subCommand == "remove") {
			const allInfractions = await InfractionsDB.getAllInfractions(target.id);

			const actionRow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
				new SelectMenuBuilder().setCustomId("infractions").setPlaceholder("Nothing selected")
			);

			const options: Array<SelectMenuComponentOptionData> = [];

			for (let i = 0; i < allInfractions.length; i++) {
				const curr = allInfractions[i];
				options.push({
					label: await punishmentTextFromId(curr.punishment),
					description: `${curr.reason} - issued at: ${curr.date_issued.toLocaleString()}`,
					value: `remove-infraction_${curr.punishment_id}`,
				});
			}

			if (options.length == 0) {
				interaction.reply("User has no infractions");
				return;
			}

			actionRow.components[0].addOptions(options);

			interaction.reply({ content: "Pick an infraction to remove", components: [actionRow] });
		}
	}
}
