import { CommandInteraction, Guild, User } from "discord.js";
import SlimyClient from "../../client";
import { cannotPunish, ModerationAction } from "../errors/common/permissions";

interface SetupReturn {
    target: User;
    reason: string;
    duration: number | null
    guild: Guild
}

export async function moderationSetup(client: SlimyClient, interaction: CommandInteraction, action: ModerationAction): Promise<SetupReturn | void> {
    let targetArg = interaction.options.get("target");
    let reasonArg = interaction.options.get("reason");
    let durationArg = interaction.options.get("duration");
    let targetUsr: User;
    let reasonTxt: string;
    let durationInt: number | null = null;

    if (!interaction.guild) return;
    if (typeof targetArg?.user == "undefined") return;

    if (typeof reasonArg?.value == "undefined") {
        reasonTxt = "not specified"
    } else {
        reasonTxt = String(reasonArg.value)
    }

    if (typeof targetArg?.user == "undefined") return;
    targetUsr = targetArg.user

    if (durationArg?.value) {
        durationInt = Number(durationArg.value);
    }
    
    if (targetUsr == client.user) {
        return cannotPunish(client, interaction, action, targetUsr, "cannot punish itself")
    }

    return {
        target: targetUsr,
        reason: reasonTxt,
        duration: durationInt,
        guild: interaction.guild
    }
}