import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, inlineCode, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import SlimyClient from "../client";
import { addEmbedFooter } from "../lib/embed-footer";
import { LevelsDB } from "../lib/mysql/levels";
import { xpToLevel } from "../lib/xp";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("level")
		.setDescription("Chatting levels")
        .addSubcommand(subcommand =>
            subcommand
                .setName("leaderboard")
                .setDescription("Get the level leaderboard")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("user")
                .setDescription("Get your level or another member's rank")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("User who's level you want to view")
                    .setRequired(false)
            )
        )
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

	async execute(client: SlimyClient, interaction: ChatInputCommandInteraction) {
        let subCommand = interaction.options.getSubcommand()

        if (subCommand == "leaderboard") {
            let leaderboard = await LevelsDB.getLeaderboard()

            let leaderboardEmbed = new EmbedBuilder()
                .setColor(0x03fc9d)
                .setTitle("Level leaderboard")
                .setTimestamp()
                await addEmbedFooter(client, leaderboardEmbed)
            
            let embedDescription = "Showing top 10 levels"

            for (let i = 0; i < leaderboard.length; i++) {
                embedDescription += `\n<@${leaderboard[i].user_id}> - **${inlineCode(String(await xpToLevel(leaderboard[i].xp)))}**`
            }

            leaderboardEmbed.setDescription(embedDescription);

            interaction.reply({ embeds: [leaderboardEmbed] })
        }

        else if (subCommand == "user") {
            let user = interaction.options.getUser("user");
            if (!user) {
                user = interaction.user
            }

            let xp = await LevelsDB.getXp(user.id)
            console.log(xp)
            if (!xp) return interaction.reply(`Failed to get the level of ${user.tag}`)

            let level = await xpToLevel(xp);
            console.log(level)
            let levelEmbed = new EmbedBuilder()
                .setColor(0x03fc9d)
                .setTitle(`Level of ${user.tag}`)
                .setDescription(`Current level is ${inlineCode(String(level))}`)
                .setTimestamp()
                await addEmbedFooter(client, levelEmbed)
            
            interaction.reply({ embeds: [levelEmbed] })
        }
    }
}