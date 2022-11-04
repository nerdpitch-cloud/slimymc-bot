import { CommandInteraction, Guild, User } from "discord.js";
import SlimyClient from "../../client";
import { cannotPunish } from "../errors/common/permissions";

export type Punishment = {
    text: string;
    id: number;
};

export class ModerationAction {
    static BAN: Punishment = { text: "ban", id: 1 }
    static TEMPBAN: Punishment = { text: "tempban", id: 1}
    static TEMPMUTE: Punishment = { text: "tempmue", id: 2}
    static WARN: Punishment = { text: "warn", id: 3}
}

interface SetupReturn {
    target: User;
    reason: string;
    duration: number | null
    guild: Guild
}

export async function moderationSetup(client: SlimyClient, interaction: CommandInteraction, action: Punishment): Promise<SetupReturn | void> {
    let targetArg = interaction.options.get("target");
    let reasonArg = interaction.options.get("reason");
    let durationArg = interaction.options.get("duration");
    let targetUsr: User;
    let reasonTxt: string;
    let durationInt: number | null = null;

    if (!interaction.guild) throw new Error("interaction.guild was null");
    if (typeof targetArg?.user == "undefined") throw new Error("targetArg?.user was undefined");

    if (typeof reasonArg?.value == "undefined") {
        reasonTxt = "not specified"
    } else {
        reasonTxt = String(reasonArg.value)
    }

    targetUsr = targetArg.user

    if (durationArg?.value) {
        durationInt = Number(durationArg.value);
    }
    
    if (targetUsr == client.user) {
        return cannotPunish(client, interaction, action.text, targetUsr, "cannot punish itself")
    }

    return {
        target: targetUsr,
        reason: reasonTxt,
        duration: durationInt,
        guild: interaction.guild
    }
}