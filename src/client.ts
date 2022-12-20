import fs from "node:fs";
import path from "node:path";

import { Client, ClientOptions, Collection } from "discord.js";
import { Command } from "./commands/_handle";

export default class SlimyClient extends Client {
	public commands: Collection<string, Command>;

	constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection();
		this.loadCommands();
	}

	private loadCommands(): void {
		const commandsPath = path.join(__dirname, "commands");
		const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);

			if (!file.startsWith("_")) {
				import(filePath).then((module) => {
					const command = new module.default() as Command;
					this.commands.set(command.data.name, command);
				});
			}
		}

		console.log(this.commands)
	}
}
