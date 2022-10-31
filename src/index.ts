import { Events, GatewayIntentBits } from "discord.js";
import { token } from "./conf/discord.json";
import { runReady } from "./events/ready";
import { handleUnexpectedError } from "./lib/errors/handler";
import SlimyClient from "./client"
import { handleCommand } from "./commands/_handle";
import { handleButton } from "./events/_handle-btn";

const client = new SlimyClient({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
	runReady(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		await handleCommand(client, interaction);
	} else if (interaction.isButton()) {
		handleButton(client, interaction)
	}
});

client.login(token);
