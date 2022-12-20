import { APIEmbedField, CDN, ChatInputCommandInteraction, EmbedBuilder, inlineCode, RestOrArray, SlashCommandBuilder } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { addEmbedFooter } from "../lib/embed-footer";
import { Command } from "./_handle";

export default class HelpCommand implements Command {
    name = "📖 Help";
    description = "List all of my commands or info about a specific command.";
    syntax = "help [command name]";
    subCommands = [];

    data = new SlashCommandBuilder()
        .setName("help")
        .setDescription("List all of my commands or info about a specific command.")
        .addStringOption((option) =>
            option
                .setName("command")
                .setDescription("Command to get info about")
                .setRequired(false)
        )
        .setDMPermission(false);

    async execute(client: SlimyClient, config: Config, interaction: ChatInputCommandInteraction) {
        const commandName = interaction.options.getString("command");

        if (!commandName) {
            const commands = client.commands.map((command) => command.data.name);
            const fields: APIEmbedField[] = [];
            for (const command of commands) {
                const commandData = client.commands.get(command);
                if (!commandData) continue;

                // get the subcommand names
                if (commandData.subCommands) {
                    const subCommands = commandData.subCommands.map((subCommand) => subCommand.name);
                }

                fields.push({
                    name: commandData.name,
                    value: `\n**Description**:\n${commandData.data.description}\n**Syntax**:\n${inlineCode("/" + commandData.syntax)}`,
                    inline: true,
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("🙋 Help")
                .setColor(0x77b94d)
                .setDescription("List of all commands")
                .addFields(fields)
                .setTimestamp()
                .setFooter({ text: "Arguments in [] are optional, arguments in <> are required."})

            return interaction.reply({ embeds: [embed] });
        }

        const foundCommand = client.commands.get(commandName);

        if (commandName && !foundCommand) {
            return interaction.reply({
                content: `Command ${inlineCode(commandName ? commandName : "?")} not found.`,
                ephemeral: true,
            });   
        }

        if (commandName && foundCommand) {

            const embed = new EmbedBuilder()
                .setTitle(foundCommand.name)
                .setColor(0x77b94d)
                .setDescription(`**Description**: ${foundCommand.description}\n**Syntax**: ${inlineCode("/" + foundCommand.syntax)}`)

            return interaction.reply({ embeds: [embed] });

        }
    }
}