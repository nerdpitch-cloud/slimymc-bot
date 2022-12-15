import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, inlineCode } from "discord.js";
import { Config } from "../../conf/config";
import { addEmbedFooter } from "../../lib/embed-footer";
import { LevelsDB } from "../../lib/mysql/levels";
import { xpToLevel } from "../../lib/xp";

export async function handleLevelLeaderboardButton(interaction: ButtonInteraction, config: Config) {
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

    let disablePrevious = false;
    let disableNext = false;

    if (index === 0) {
        disablePrevious = true
    }

    if (index === Math.floor(leaderboard.length / 10)) {
        disableNext = true
    }

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`level_leaderboard_${index - 1}`)
            .setLabel("Previous")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disablePrevious),
        new ButtonBuilder()
            .setCustomId(`level_leaderboard_${index + 1}`)
            .setLabel("Next")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disableNext)
    );


    await interaction.update({ embeds: [leaderboardEmbed], components: [actionRow] });
}