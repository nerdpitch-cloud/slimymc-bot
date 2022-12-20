import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import fs from "node:fs";
import { Config, Enviroment } from "../conf/config";
import { Command } from "./_handle";
import { BanCommand }  from "./ban";
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

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [
	new BanCommand().data.toJSON(),
	new CountCommand().data.toJSON(),
	new EvalCommand().data.toJSON(),
	new HelpCommand().data.toJSON(),
	new InfractionsCommand().data.toJSON(),
	new InvtesCommmand().data.toJSON(),
	new LevelCommand().data.toJSON(),
	new PingCommand().data.toJSON(),
	new TempbanCommand().data.toJSON(),
	new TempmuteCommand().data.toJSON(),
	new WarnCommand().data.toJSON(),
];

const rest = new REST({ version: "10" }).setToken(config.discord.token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId), { body: commands });

		if (data instanceof Array<any>) {
			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
			console.log(data.map((command) => command.name));
		}
	} catch (error) {
		console.error(error);
	}
})();
