import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import fs from "node:fs";
import { Config, Enviroment } from "../conf/config";
import { Command } from "./_handle";

const enviroment = process.argv.slice(2)[0];

let config: Config;

if (enviroment === "dev") {
	config = new Config(Enviroment.DEV);
} else {
	config = new Config(Enviroment.PROD);
}

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const commandsPath = "./dist/commands";
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js") && !file.startsWith("_"));

const rest = new REST({ version: "10" }).setToken(config.discord.token);

(async () => {
	for (const file of commandFiles) {
		await import(`${__dirname}/${file}`).then((module) => {
			const command = new module.default() as Command;
			commands.push(command.data.toJSON());
		});
	}

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
