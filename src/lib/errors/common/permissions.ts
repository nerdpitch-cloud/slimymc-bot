import { CommandInteraction, User } from "discord.js";
import SlimyClient from "../../../client";
import { handleExpectedError } from "../handler";
import { ModerationAction } from "../../moderation/moderation";

export async function cannotPunish(client: SlimyClient, interaction: CommandInteraction, action: ModerationAction, target: User, reason: string | null = null) {
    if (!interaction.channel) throw new Error("interaction.channel was null");

    let error = `Missing permission to ${action} ${target.username}#${target.discriminator} (${target.id}) - ${reason}`;

    handleExpectedError(client, interaction, error)
}