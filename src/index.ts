import { Events, GatewayIntentBits } from "discord.js";
import { token } from "./conf/discord.json";
import { runReady } from "./events/ready";
import SlimyClient from "./client"
import { handleCommand } from "./commands/_handle";
import { handleButton } from "./events/_handle-btn";
import { handleGuildMemberUpdate } from "./events/guild/member-update";
import { handleUserUpdate } from "./events/guild/user-update";

const client = new SlimyClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once(Events.ClientReady, () => {
	runReady(client);
});

client.on(Events.UserUpdate, async (oldUser, newUser) => {
	handleUserUpdate(oldUser, newUser);
})
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
	handleGuildMemberUpdate(oldMember, newMember);
})

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		await handleCommand(client, interaction);
	} else if (interaction.isButton()) {
		handleButton(client, interaction)
	}
});

client.login(token);
