import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, inlineCode, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { addEmbedFooter } from "../lib/embed-footer";
import { LevelsDB } from "../lib/mysql/levels";
import { xpToLevel } from "../lib/xp";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("rank")
		.setDescription("Chatting rank")
        .addSubcommand(subcommand =>
            subcommand
                .setName("leaderboard")
                .setDescription("Get the rank leaderboard")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("user")
                .setDescription("Get your rank or another member's rank")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("User who's rank you want to view")
                    .setRequired(false)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("give")
                .setDescription("Give xp to a user")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("User who'd you like to add the xp to")
                    .setRequired(false)
            )
        )
        .addSubcommandGroup(subcommandgroup =>
            subcommandgroup
                
        )
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: ChatInputCommandInteraction) {
        let subCommand = interaction.options.getSubcommand()

        if (subCommand == "leaderboard") {
            let leaderboard = await LevelsDB.getLeaderboard()

            let leaderboardEmbed = new EmbedBuilder()
                .setColor(0x03fc9d)
                .setTitle("Rank leaderboard")
                .setTimestamp()
                await addEmbedFooter(client, leaderboardEmbed)
            
            let embedDescription = "Showing top 10 rank"

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
            if (!xp) return interaction.reply(`Failed to get the rank of ${user.tag}`)

            let level = await xpToLevel(xp);
            console.log(level)
            let levelEmbed = new EmbedBuilder()
                .setColor(0x03fc9d)
                .setTitle(`Rank of ${user.tag}`)
                .setDescription(`Current rank is ${inlineCode(String(level))}`)
                .setTimestamp()
                await addEmbedFooter(client, levelEmbed)
            
            interaction.reply({ embeds: [levelEmbed] })
        }
    }
}