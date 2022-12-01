import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
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
		let leaderboard = await InvitesDB.getAll()

        var items = Object.keys(leaderboard).map(function(key) {
            return [key, leaderboard[Number(key)]];
        });
        
        items.sort(function(first, second) {
            return Number(second[1]) - Number(first[1]);
        });

        let leaderboardEmbed = new EmbedBuilder()
            .setTitle("Invite leaderboard")
            .setColor(0x4b90f3)
            .setTimestamp()
            await addEmbedFooter(client, leaderboardEmbed)

        let embedDescription = "Showing top 10 inviters\n"
        let top10 = items.slice(0, 5)

        for (let i = 0; i < top10.length; i++) {
            embedDescription += `\n<@${top10[i][0]}> - **${top10[i][1]}**`
        }

        leaderboardEmbed.setDescription(embedDescription);

        await interaction.reply({ embeds: [leaderboardEmbed] })

	},
};
