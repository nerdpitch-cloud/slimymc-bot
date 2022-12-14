import {
	bold,
	ChatInputCommandInteraction,
	EmbedBuilder,
	inlineCode,
	PermissionFlagsBits,
	PermissionsBitField,
	SlashCommandBuilder,
} from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { addEmbedFooter } from "../lib/embed-footer";
import { userMissingPermissions } from "../lib/errors/common/permissions";
import { CountingDB } from "../lib/mysql/counting";
import { VariablesDB } from "../lib/mysql/variables";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("count")
		.setDescription("Counting channel information")
		.addSubcommand((subcommand) => subcommand.setName("current").setDescription("Get the current count"))

		.addSubcommand((subcommand) =>
			subcommand
				.setName("set-current")
				.setDescription("Get the current count")
				.addNumberOption((option) =>
					option.setName("value").setDescription("Value to which you'd like to set the current count to").setRequired(true)
				)
		)

		.addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Get the counting leaderboard"))

		.setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: ChatInputCommandInteraction) {
		const subCommand = interaction.options.getSubcommand();

		switch (subCommand) {
			case "current":
				const latestCount = await VariablesDB.get("latestCount");

				interaction.reply(`Latest count is ${inlineCode(String(latestCount.value))}`);

				break;

			case "set-current":
				if (interaction.member?.permissions instanceof PermissionsBitField) {
					if (interaction.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
						const val = interaction.options.getNumber("value");
						if (!val) throw new Error("value was none");

						await VariablesDB.set("latestCount", val);

						interaction.reply(`Current count set to ${inlineCode(String(val))}`);
					} else {
						userMissingPermissions(client, interaction, "set count");
					}
				}

				break;

			case "leaderboard":
				const leaderboard = await CountingDB.getAll();

				const leaderboardEmbed = new EmbedBuilder().setColor(0x77b94d).setTitle("Counting leaderboard").setTimestamp();
				await addEmbedFooter(client, leaderboardEmbed);

				let embedDescription = "Showing top 10 counters";

				for (let i = 0; i < 10; i++) {
					embedDescription += `\n${bold(String(i + 1))} • ${inlineCode(String(leaderboard[i].count))} • <@${leaderboard[i].userId}>`;
				}

				leaderboardEmbed.setDescription(embedDescription);

				interaction.reply({ embeds: [leaderboardEmbed] });

				break;
		}
	},
};
