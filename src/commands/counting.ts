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
		.setName("count")
		.setDescription("Counting channel information")
        .addSubcommand(subcommand =>
            subcommand
                .setName("current")
                .setDescription("Get the current count")
        )
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: ChatInputCommandInteraction) {
        let subCommand = interaction.options.getSubcommand()

        switch (subCommand) {
            case "current": 
                let latestCount = await VariablesDB.get("latestCount")
                console.log(latestCount)
                interaction.reply(`Latest count is ${inlineCode(String(latestCount))}`)
        }
    }
}