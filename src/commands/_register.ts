import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import fs from "node:fs";
import { Config, Enviroment } from "../conf/config";
import { Command } from "./_handle";
import { BanCommand } from "./ban";
import { CountCommand } from "./counting";
import { EvalCommand } from "./eval";
import { HelpCommand } from "./help";
import { InfractionsCommand } from "./infractions";
import { InvtesCommmand } from "./invites";
import { LevelCommand } from "./level";
import { PingCommand } from "./ping";
import { TempbanCommand } from "./tempban";
import { TempmuteCommand } from "./tempmute";
import { WarnCommand } from "./warn";

const enviroment = process.argv.slice(2)[0];

let config: Config;

if (enviroment === "dev") {
	config = new Config(Enviroment.DEV);
} else {
	config = new Config(Enviroment.PROD);
}

export const commands = [
	new BanCommand(),
	new CountCommand(),
	new EvalCommand(),
	new HelpCommand(),
	new InfractionsCommand(),
	new InvtesCommmand(),
	new LevelCommand(),
	new PingCommand(),
	new TempbanCommand(),
	new TempmuteCommand(),
	new WarnCommand(),
];

const rest = new REST({ version: "10" }).setToken(config.discord.token);

async function registerCommands() {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId), {
			body: commands.map((command) => command.data.toJSON()),
		});

		if (data instanceof Array<any>) {
			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
			console.log(data.map((command) => command.name));
		}
	} catch (error) {
		console.error(error);
	}
}

if (require.main === module) {
	registerCommands();
}
