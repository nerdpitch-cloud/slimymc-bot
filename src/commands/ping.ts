import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { Command } from "./_handle";

export class PingCommand implements Command {
	name = "🏓 Ping";
	description = "Get the bot's latency";
	syntax = "ping";

	data = new SlashCommandBuilder().setName("ping").setDescription("Ping!");

	async execute(client: SlimyClient, config: Config, interaction: CommandInteraction) {
		await interaction.reply(`🏓 Latency is ${Math.round(client.ws.ping)}ms`);
	}
}
