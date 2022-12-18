import { bold, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { addEmbedFooter } from "../lib/embed-footer";
import { generateLeaderboardButtons, LeaderboardType } from "../lib/leaderboard-gen";
import { InvitesDB } from "../lib/mysql/invites";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("invites")
		.setDescription("See the invites leaderboard")

		.setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: CommandInteraction) {
		const leaderboard = await InvitesDB.getLeaderboard();

		const leaderboardEmbed = new EmbedBuilder().setColor(0x77b94d).setTitle("Invites leaderboard").setTimestamp();
		await addEmbedFooter(client, leaderboardEmbed);

		let embedDescription = "Showing top 10 inviters";

		for (let i = 0; i < 10; i++) {
			if (typeof leaderboard[i] !== "undefined") {
				embedDescription += `\n${bold(String(i + 1))} • <@${leaderboard[i].userId}> • ${bold(String(leaderboard[i].invites))}`;
			} else {
				break;
			}
		}

		leaderboardEmbed.setDescription(embedDescription);

		const actionRow = await generateLeaderboardButtons(0, LeaderboardType.INVITES, leaderboard);

		await interaction.reply({ embeds: [leaderboardEmbed], components: [actionRow] });
	},
};
