import { ChatInputCommandInteraction, inlineCode, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { userMissingPermissions } from "../lib/errors/common/permissions";
import { VariablesDB } from "../lib/mysql/variables";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("count")
		.setDescription("Counting channel information")
        .addSubcommand(subcommand =>
            subcommand
                .setName("current")
                .setDescription("Get the current count")
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName("set-current")
                .setDescription("Get the current count")
                .addNumberOption((option) =>
                    option
                        .setName("value")
                        .setDescription("Value to which you'd like to set the current count to")
                        .setRequired(true)
            )
        )

        .setDMPermission(false),

	async execute(client: SlimyClient, config: Config, interaction: ChatInputCommandInteraction) {
        let subCommand = interaction.options.getSubcommand()

        switch (subCommand) {
            case "current": 
                let latestCount = await VariablesDB.get("latestCount")
                
                interaction.reply(`Latest count is ${inlineCode(String(latestCount.value))}`)

                break;

            case "set-current":
                if (interaction.member?.permissions instanceof PermissionsBitField) {
                    if (interaction.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                        let val = interaction.options.getNumber("value")
                        if (!val) throw new Error("value was none")

                        await VariablesDB.set("latestCount", val)

                        interaction.reply(`Current count set to ${inlineCode(String(val))}`)
                    } else{
                        userMissingPermissions(client, interaction, "set count")
                    }
                }

                break;
        }
    }
}