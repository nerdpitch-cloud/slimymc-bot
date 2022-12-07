import { bold, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { addEmbedFooter } from "../lib/embed-footer";
import { InvitesDB } from "../lib/mysql/invites";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("invites")
		.setDescription("See the invites leaderboard")

		.setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: CommandInteraction) {
		let allInvites = await InvitesDB.getAll();

		let leaderboardDict: { [inviterId: string]: number } = {};

		for (let i = 0; i < allInvites.length; i++) {
			leaderboardDict[allInvites[i].inviterId] = Number(leaderboardDict[allInvites[i].inviterId]) + 1 || 1;
		}

		var leaderboardArr = Object.keys(leaderboardDict).map((key) => {
			return [key, leaderboardDict[key]];
		});

		leaderboardArr
			.sort((first, second) => {
				return Number(first[1]) - Number(second[1]);
			})
			.reverse();

		let leaderboardEmbed = new EmbedBuilder().setColor(0x77b94d).setTitle("Invites leaderboard").setTimestamp();
		await addEmbedFooter(client, leaderboardEmbed);

		let embedDescription = "Showing top 10 inviters";

		for (let i = 0; i < 10; i++) {
			if (typeof leaderboardArr[i] !== "undefined") {
				embedDescription += `\n${bold(String(i + 1))} • <@${leaderboardArr[i][0]}> • ${bold(String(leaderboardArr[i][1]))}`;
			} else {
				break;
			}
		}

		leaderboardEmbed.setDescription(embedDescription);

		await interaction.reply({ embeds: [leaderboardEmbed] });
	},
};
