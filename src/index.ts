import { Events, GatewayIntentBits, Partials } from "discord.js";
import { runReady } from "./events/ready";
import SlimyClient from "./client";
import { handleCommand } from "./commands/_handle";
import { handleGuildMemberUpdate } from "./events/guild/member-update";
import { handleUserUpdate } from "./events/user-update";
import { handleInviteCreate, handleInviteDelete, handleMemberAdd } from "./events/guild/member-add";
import { handleMemberRemove } from "./events/guild/member-remove";
import { handleMessageUpdate } from "./events/message-update";
import { handleMessageDelete } from "./events/message-delete";
import { handleButton } from "./events/buttons/_handle-btn";
import { handleSelectMenu } from "./events/selects/_handle-select";
import { handleMessageCreate } from "./events/message-create";
import { Config, Enviroment } from "./conf/config";

const client = new SlimyClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
	],
	partials: [Partials.Message],
});

const enviroment = process.argv.slice(2)[0];

let config: Config;

if (enviroment === "dev") {
	config = new Config(Enviroment.DEV);
} else {
	config = new Config(Enviroment.PROD);
}

client.once(Events.ClientReady, () => {
	runReady(client, config);
});

client.on(Events.InviteCreate, (invite) => {
	handleInviteCreate(invite);
});
client.on(Events.InviteDelete, (invite) => {
	handleInviteDelete(invite);
});

client.on(Events.GuildMemberAdd, async (member) => {
	handleMemberAdd(config, member);
});
client.on(Events.GuildMemberRemove, async (member) => {
	handleMemberRemove(config, member);
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
	handleMessageUpdate(config, oldMessage, newMessage);
});
client.on(Events.MessageDelete, async (message) => {
	handleMessageDelete(config, message);
});

client.on(Events.MessageCreate, async (message) => {
	handleMessageCreate(client, config, message);
});

client.on(Events.UserUpdate, async (oldUser, newUser) => {
	handleUserUpdate(config, oldUser, newUser);
});
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
	handleGuildMemberUpdate(config, oldMember, newMember);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		await handleCommand(client, config, interaction);
	} else if (interaction.isButton()) {
		await handleButton(config, interaction);
	} else if (interaction.isSelectMenu()) {
		await handleSelectMenu(config, interaction);
	}
});

client.login(config.discord.token);
