import fs from "node:fs";
import path from "node:path";

import { Client, ClientOptions, Collection } from "discord.js";
import { Command } from "./commands/_handle";
import { commands as allCommands } from "./commands/_register";

export default class SlimyClient extends Client {
	public commands: Collection<string, Command>;

	constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection();
		this.loadCommands();
	}

	private loadCommands(): void {
		for (const command of allCommands) {
			this.commands.set(command.data.name, command);
		}
	}
}
