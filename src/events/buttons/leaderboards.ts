import { bold, ButtonInteraction, EmbedBuilder, inlineCode } from "discord.js";
import { Config } from "../../conf/config";
import { addEmbedFooter } from "../../lib/embed-footer";
import { generateLeaderboardButtons, LeaderboardType } from "../../lib/leaderboard-gen";
import { CountingDB } from "../../lib/mysql/counting";
import { InvitesDB } from "../../lib/mysql/invites";
import { LevelsDB } from "../../lib/mysql/levels";
import { xpToLevel } from "../../lib/xp";


export async function handleLevelLeaderboardButton(interaction: ButtonInteraction, config: Config) {
    if (interaction.message.interaction?.user.id !== interaction.user.id) return;

    const index = Number(interaction.customId.split("_")[2]);
    const leaderboard = await LevelsDB.getAll();
    const page = leaderboard.slice(index * 10, index * 10 + 10);

    const leaderboardEmbed = new EmbedBuilder().
        setColor(0x77b94d).
        setTitle("Level leaderboard").
        setTimestamp();
        await addEmbedFooter(interaction.client, leaderboardEmbed);

    let embedDescription = "Showing levels leaderboard";

    for (let i = 0; i < 10; i++) {
        if (!page[i]) break;
        
        embedDescription += `\n**${index * 10 + i + 1} • **${inlineCode(`lvl ${String(await xpToLevel(page[i].xp))}`)}** • **<@${
            page[i].userId
        }>`;
    }

    leaderboardEmbed.setDescription(embedDescription);

    const actionRow = await generateLeaderboardButtons(index, LeaderboardType.LEVELS, leaderboard)


    await interaction.update({ embeds: [leaderboardEmbed], components: [actionRow] });
}

export async function handleInvitesLeaderboardButton(interaction: ButtonInteraction, config: Config) {
    if (interaction.message.interaction?.user.id !== interaction.user.id) return;

    const index = Number(interaction.customId.split("_")[2]);
    const leaderboard = await InvitesDB.getLeaderboard();
    const page = leaderboard.slice(index * 10, index * 10 + 10);

    const leaderboardEmbed = new EmbedBuilder().
        setColor(0x77b94d).
        setTitle("Level leaderboard").
        setTimestamp();
        await addEmbedFooter(interaction.client, leaderboardEmbed);

		let embedDescription = "Showing top 10 inviters";

		for (let i = 0; i < 10; i++) {
            if (!page[i]) break;

			embedDescription += `\n**${index * 10 + i + 1}** • <@${page[i].userId}> • **${page[i].invites}**`;
		}

    leaderboardEmbed.setDescription(embedDescription);

    const actionRow = await generateLeaderboardButtons(index, LeaderboardType.INVITES, leaderboard)
    await interaction.update({ embeds: [leaderboardEmbed], components: [actionRow] });
}

export async function handleCountingLeaderboardButton(interaction: ButtonInteraction, config: Config) {
    if (interaction.message.interaction?.user.id !== interaction.user.id) return;

    const index = Number(interaction.customId.split("_")[2]);
    const leaderboard = await CountingDB.getAll();
    const page = leaderboard.slice(index * 10, index * 10 + 10);

    const leaderboardEmbed = new EmbedBuilder()
        .setColor(0x77b94d)
        .setTitle("Counting leaderboard")
        .setTimestamp();
        await addEmbedFooter(interaction.client, leaderboardEmbed);

		let embedDescription = "Showing top 10 inviters";

        for (let i = 0; i < 10; i++) {
            if (!page[i]) break;

            embedDescription += `\n$**{index * 10 + i + 1}** • ${inlineCode(String(page[i].count))} • <@${page[i].userId}>`;
        }

    leaderboardEmbed.setDescription(embedDescription);

    const actionRow = await generateLeaderboardButtons(index, LeaderboardType.COUNTING, leaderboard)
    await interaction.update({ embeds: [leaderboardEmbed], components: [actionRow] });
    
}