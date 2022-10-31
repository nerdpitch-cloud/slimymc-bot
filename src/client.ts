import fs  from "node:fs";
import path  from "node:path"

import { Client, ClientOptions, Collection } from "discord.js";

export default class SlimyClient extends Client {
	public commands: Collection<String, ApplicationCommandModule>;

	constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection();
		this.loadCommands();
	}

	private loadCommands(): void {
		const commandsPath = path.join(__dirname, "commands");
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith(".js"));
		
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
		
			if (!file.startsWith("_")) {
				const command = require(filePath);
				this.commands.set(command.data.name, command);
			}
		}
	}
}

export interface ApplicationCommandModule {
    execute: Function
}