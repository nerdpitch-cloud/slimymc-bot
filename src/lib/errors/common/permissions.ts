import { CommandInteraction, User } from "discord.js";
import SlimyClient from "../../../client";
import { handleExpectedError } from "../handler";

export class ModerationAction {
    static BAN = "ban"
    static TEMPBAN = "tempban"
    static TEMPMUTE = "tempmute"
    static WARN = "warn"
}

export async function cannotPunish(client: SlimyClient, interaction: CommandInteraction, action: ModerationAction, target: User, reason: string | null = null) {
    if (!interaction.channel) throw new Error("interaction.channel was null");

    let error = `Missing permission to ${action} ${target.username}#${target.discriminator} (${target.id}) - ${reason}`;

    handleExpectedError(client, interaction, error)
}