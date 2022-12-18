import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { CountingEntry, InvitesLeaderboardEntry, LevelsEntry } from "./mysql/types";

export class LeaderboardType {
    static readonly LEVELS = "level_leaderboard";
    static readonly INVITES = "invites_leaderboard";
    static readonly COUNTING = "counting_leaderboard";
}

export async function generateLeaderboardButtons(index: number, type: LeaderboardType, leaderboard: LevelsEntry[] | InvitesLeaderboardEntry[] | CountingEntry[]) {
    let disablePrevious = false;
    let disableNext = false;

    if (index === 0) {
        disablePrevious = true
    }

    if (leaderboard) {
        if (index === Math.floor(leaderboard.length / 10)) {
            disableNext = true
        }
    }

    console.log(type)
    
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`${type}_${index - 1}`)
            .setLabel("Previous")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disablePrevious),
        new ButtonBuilder()
            .setCustomId(`${type}_${index + 1}`)
            .setLabel("Next")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disableNext)
    );

    return actionRow;
}