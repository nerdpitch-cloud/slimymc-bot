import { CommandInteraction, Interaction, User } from "discord.js";
import SlimyClient from "../../../client";
import { handleExpectedError } from "../handler";
import { ModerationAction } from "../../moderation/moderation";

export async function cannotPunish(
	client: SlimyClient,
	interaction: CommandInteraction,
	action: ModerationAction,
	target: User,
	reason: string | null = null
) {
	if (!interaction.channel) throw new Error("interaction.channel was null");

	const error = `Missing permission to ${action} ${target.username}#${target.discriminator} (${target.id}) - ${reason})`;

	handleExpectedError(client, interaction, error);
}

export async function userMissingPermissions(client: SlimyClient, interaction: CommandInteraction, action: string) {
	if (!interaction.channel) throw new Error("interaction.channel was null");

	const error = `You do not have the sufficient permission to run ${action}`;

	handleExpectedError(client, interaction, error);
}
