import { REST, Routes } from "discord.js";
import { clientId, guildId, token } from "../conf/discord.json";
import fs from "node:fs";

const commands = [];

const commandFiles = fs
	.readdirSync("./dist/commands")
	.filter((file) => file.endsWith(".js") && !file.startsWith("_"));

for (const file of commandFiles) {
    console.log(file);
	const command = require(`./${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands }
		);
		
		if (data instanceof Array<any>) {
			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		}

	} catch (error) {
		console.error(error);
	}
})();
