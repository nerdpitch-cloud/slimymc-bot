import { REST, Routes } from "discord.js";
import fs from "node:fs";
import { Config, Enviroment } from "../conf/config";

const enviroment = process.argv.slice(2)[0];

let config: Config;

if (enviroment === "dev") {
	config = new Config(Enviroment.DEV);
} else {
	config = new Config(Enviroment.PROD);
}

const commands = [];

const commandFiles = fs.readdirSync("./dist/commands").filter((file) => file.endsWith(".js") && !file.startsWith("_"));

for (const file of commandFiles) {
	console.log(file);
	const command = require(`./${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(config.discord.token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId), { body: commands });

		if (data instanceof Array<any>) {
			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		}
	} catch (error) {
		console.error(error);
	}
})();
