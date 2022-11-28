import { CommandInteraction, EmbedBuilder, Guild, inlineCode, Interaction, User } from "discord.js";
import SlimyClient from "../../client";
import { Config } from "../../conf/config";
import { addEmbedFooter } from "../embed-footer";
import { cannotPunish } from "../errors/common/permissions";
import { InfractionsDB } from "../mysql/infractions";
import { sendModLog } from "./modlog";
import { sendDmEmbed } from "./send-dm";
import { TempBanFile } from "./tempban";

let punishmentIds = [
    "ban",
    "tempban",
    "tempmute",
    "warn"
]

export type Punishment = {
    text: string;
    id: number;
    color: number
    duration: boolean
};

export class ModerationAction {
    static BAN: Punishment = {
        text: "ban",
        id: 0,
        color: 0xbb2525,
        duration: false
    }

    static TEMPBAN: Punishment = {
        text: "tempban",
        id: 1,
        color: 0xbb2525,
        duration: true
    }
    
    static TEMPMUTE: Punishment = {
        text: "tempmute",
        id: 2,
        color: 0xbb2525,
        duration: true
    }

    static WARN: Punishment = {
        text: "warn",
        id: 3,
        color: 0xbb2525,
        duration: false
    }
}

export type ModerationOptions = {
    author: User
    target: User
    guild: Guild
    reason: string | null
    duration: number | null
}

export async function punishmentTextFromId(id: number) {
    return punishmentIds[id]
}

export async function genModerationOptions(interaction: CommandInteraction): Promise<ModerationOptions> {
    let target = interaction.options.getUser("user")
    let guild = interaction.guild

    if (!target || !guild) throw new Error("error in generating moderation options")

    return {
        author: interaction.user,
        target: target,
        guild: guild,
        reason: String(interaction.options.get("reason")?.value),
        duration: Number(interaction.options.get("duration")?.value)
    }
}
export async function handleModeration(client: SlimyClient, config: Config, command: ModerationOptions, punishment: Punishment) {
    if (!command.reason) {
        command.reason = "not specified"
    }

    let dmEmbed = new EmbedBuilder()
        .setColor(punishment.color)
        .setTitle(`You have been ${punishment.text}ed`)
        .setDescription(`You have been ${punishment.text}ed by **${command.author.tag}** from **${command.guild.name}**\nReason: ${inlineCode(command.reason)}\n${command.duration ? `duration: ${command.duration} hours` : ""}`)
        .setTimestamp()
        await addEmbedFooter(client, dmEmbed);

    await sendDmEmbed(client, command.target, dmEmbed);

    let modlogEmbed = new EmbedBuilder()
        .setColor(punishment.color)
        .setTitle(`You have been ${punishment.text}ed`)
        .setDescription(`<@${command.author.id}> has banned <@${command.target.id}> with reason:\n${inlineCode(command.reason)}\n${command.duration ? `duration: ${command.duration} hours` : ""}`)
        .setTimestamp()
        await addEmbedFooter(client, modlogEmbed);

    await sendModLog(client, config, modlogEmbed)

    if (!command.duration) {
        command.duration = 1
    }

    let durationTimestamp = await TempBanFile.genExpiration(command.duration)
    let memberTarget = await command.guild.members.fetch(command.target.id)
    
    switch(punishment.id) {
        case 0: // ban
            await command.guild.members.ban(command.target.id, { reason: command.reason });
            await InfractionsDB.addInfraction(command.target.id, ModerationAction.BAN, command.reason)

            break;

        case 1: // tempban
            await command.guild.members.ban(command.target.id, { reason: command.reason });

            await InfractionsDB.addInfraction(command.target.id, ModerationAction.TEMPBAN, command.reason)
            await TempBanFile.addMember(command.target.id, command.guild.id, durationTimestamp)

            break;

        case 2: // tempmute
            await memberTarget.timeout(command.duration * 3600000, command.reason);

            await InfractionsDB.addInfraction(command.target.id, ModerationAction.TEMPMUTE, command.reason)

            break;

        case 3: // warn
            let recentInfractions = await InfractionsDB.getRecentInfractions(command.target.id);
            let additionalPunishment = "No additional punishment"
            
            if (recentInfractions.result.length == 2) {
                await memberTarget.timeout(1 * 3600000, command.reason); // 1 hour
                additionalPunishment = "1 hour timeout";

            } else if(recentInfractions.result.length == 3 || recentInfractions.result.length == 4) {
                await memberTarget.timeout(24 * 3600000, command.reason); // 24 hours
                additionalPunishment = "24 hour timeout";

            } else if (recentInfractions.result.length >= 5) {
                additionalPunishment = "1 week temporary ban";

                let durationTimestamp = await TempBanFile.genExpiration(168);
                await command.guild.members.ban(command.target.id, { reason: command.reason });
                TempBanFile.addMember(command.target.id, command.guild.id, durationTimestamp)
            }

            await InfractionsDB.addInfraction(command.target.id, ModerationAction.WARN, command.reason)

            break;

    }
}