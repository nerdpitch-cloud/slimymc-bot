import { Events, GatewayIntentBits, Partials  } from "discord.js";
import { token } from "./conf/discord.json";
import { runReady } from "./events/ready";
import SlimyClient from "./client"
import { handleCommand } from "./commands/_handle";
import { handleButton } from "./events/_handle-btn";
import { handleGuildMemberUpdate } from "./events/guild/member-update";
import { handleUserUpdate } from "./events/guild/user-update";
import { handleInviteCreate, handleInviteDelete, handleMemberAdd } from "./events/guild/member-add";
import { handleMemberRemove } from "./events/guild/member-remove";
import { handleMessageUpdate } from "./events/message-update";
import { handleMessageDelete } from "./events/message-delete";

const client = new SlimyClient({ 
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildInvites, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
	partials: [Partials.Message] });

client.once(Events.ClientReady, () => {
	runReady(client);
});

client.on(Events.InviteCreate, (invite) => {
	handleInviteCreate(invite);
});
client.on(Events.InviteDelete, (invite) => {
	handleInviteDelete(invite);
});

client.on(Events.GuildMemberAdd, async (member) =>{
	handleMemberAdd(member);
});
client.on(Events.GuildMemberRemove, async (member) =>{
	handleMemberRemove(member);
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
	handleMessageUpdate(oldMessage, newMessage);
})
client.on(Events.MessageDelete, async (message) => {
	handleMessageDelete(message);
})

client.on(Events.UserUpdate, async (oldUser, newUser) => {
	handleUserUpdate(oldUser, newUser);
});
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
	handleGuildMemberUpdate(oldMember, newMember);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		await handleCommand(client, interaction);
	} else if (interaction.isButton()) {
		handleButton(client, interaction)
	}
});

client.login(token);
