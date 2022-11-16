import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, inlineCode, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder, time, User } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { addEmbedFooter } from "../lib/embed-footer";
import { userMissingPermissions } from "../lib/errors/common/permissions";
import { LevelsDB } from "../lib/mysql/levels";
import { VariablesDB } from "../lib/mysql/variables";
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
                .setName("give-xp")
                .setDescription("Give xp to a user")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("User who'd you like to add the xp to")
                    .setRequired(true)
            )
            .addNumberOption((option) =>
            option
                .setName("xp")
                .setDescription("The amount of xp you'd like to give the user")
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("set-multiplier")
                .setDescription("Set xp multiplier")
            .addNumberOption((option) =>
                option
                    .setName("multiplier")
                    .setDescription("The multiplier to xp")
                    .setRequired(true)
            )
        )
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: ChatInputCommandInteraction) {
        let subCommand = interaction.options.getSubcommand()

        switch (subCommand) {
            case "leaderboard": 
                let leaderboard = await LevelsDB.getLeaderboard()

                let leaderboardEmbed = new EmbedBuilder()
                    .setColor(0x77b94d)
                    .setTitle("Rank leaderboard")
                    .setTimestamp()
                    await addEmbedFooter(client, leaderboardEmbed)
                
                let embedDescription = "Showing top 10 ranks"
    
                for (let i = 0; i < leaderboard.length; i++) {
                    embedDescription += `\n**${i+1} • **${inlineCode(`lvl ${String(await xpToLevel(leaderboard[i].xp))}`)}** • **<@${leaderboard[i].user_id}>`
                }
    
                leaderboardEmbed.setDescription(embedDescription);
    
                interaction.reply({ embeds: [leaderboardEmbed] })

                break;

            case "user": 
                let user = interaction.options.getUser("user");
                if (!user) {
                    user = interaction.user
                }
    
                let xp = await LevelsDB.getXp(user.id)
                if (!xp) return interaction.reply(`Failed to get the rank of ${user.tag}`)
    
                let level = await xpToLevel(xp);
                let levelEmbed = new EmbedBuilder()
                    .setColor(0x77b94d)
                    .setTitle(`Rank of ${user.tag}`)
                    .setDescription(`Current rank is ${inlineCode(String(level))}`)
                    .setTimestamp()
                    await addEmbedFooter(client, levelEmbed)
                
                interaction.reply({ embeds: [levelEmbed] })

                break;

            case "give-xp": 
                if (interaction.member?.permissions instanceof PermissionsBitField) {
                    let user = interaction.options.getUser("user")
                    let xpToAdd = interaction.options.get("xp")?.value
    
                    if (interaction.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                        if (user instanceof User && xpToAdd) {
    
                            LevelsDB.addXp(user.id, Number(xpToAdd))
                            interaction.reply(`Added ${xpToAdd} xp to <@${user.id}>`)
                        }
    
                    } else{
                        userMissingPermissions(client, interaction, "add xp")
                    }
                }

            case "set-multiplier":
                if (interaction.member?.permissions instanceof PermissionsBitField) {
                    let xpMultiplier = interaction.options.get("multiplier")?.value
    
                    if (interaction.member?.permissions.has(PermissionFlagsBits.Administrator)) {
                        if (xpMultiplier) {
                            let expires = Math.round(new Date().getTime() / 1000 + 86400)
                            await VariablesDB.set("xp_multiplier", `{"expires": ${expires}, "value": ${xpMultiplier}}`)

                            interaction.reply(`Set multipler to ${xpMultiplier}, expires at ${time(expires, "F")}`)
                        }

                    } else{
                        userMissingPermissions(client, interaction, "set xp multiplier")
                    }
                }
        }
    }
}