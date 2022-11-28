import { bold, CommandInteraction, EmbedBuilder, Guild, inlineCode, Interaction, User } from "discord.js";
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
    text: PunishmentText;
    id: number;
    color: number
    duration: boolean
};

interface PunishmentText {
    noun: string
    verb: string
}

export class ModerationAction {
    static BAN: Punishment = {
        text: {
            noun: "ban",
            verb: "banned"
        },
        id: 0,
        color: 0xbb2525,
        duration: false
    }

    static TEMPBAN: Punishment = {
        text: {
            noun: "tempban",
            verb: "tempbanned"
        },
        id: 1,
        color: 0xbb2525,
        duration: true
    }
    
    static TEMPMUTE: Punishment = {
        text: {
            noun: "tempmute",
            verb: "tempmuted"
        },
        id: 2,
        color: 0xbb2525,
        duration: true
    }

    static WARN: Punishment = {
        text: {
            noun: "warn",
            verb: "warned"
        },
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
    let durationTimestamp = await TempBanFile.genExpiration(command.duration)
    let memberTarget = await command.guild.members.fetch(command.target.id)
    let recentInfractions = await InfractionsDB.getRecentInfractions(command.target.id);
    let additionalPunishment = ""
    
    console.log(recentInfractions.result.length)

    if (recentInfractions.result.length + 1 == 2) {
        additionalPunishment =  `\nAdditional punishment - ${bold("1 hour timeout")}`

    } else if(recentInfractions.result.length + 1 == 3 || recentInfractions.result.length + 1 == 4) {
        additionalPunishment = `\nAdditional punishment -  ${bold("24 hour timeout")}`

    } else if (recentInfractions.result.length + 1 >= 5) {
        additionalPunishment = `\nAdditional punishment - ${bold("1 week temporary ban")}`
    }

    if (!command.reason) {
        command.reason = "not specified"
    }

    let dmDescription = `You have been ${punishment.text.verb} by **${command.author.tag}** from **${command.guild.name}**\nReason: ${inlineCode(command.reason)}\n${command.duration ? `duration: ${command.duration} hours` : ""}${additionalPunishment}`
    let logDescription = `<@${command.author.id}> has ${punishment.text.verb} <@${command.target.id}> with reason:\n${inlineCode(command.reason)}\n${command.duration ? `duration: ${command.duration} hours` : ""}${additionalPunishment}`

    let dmEmbed = new EmbedBuilder()
        .setColor(punishment.color)
        .setTitle(`You have been ${punishment.text.verb}`)
        .setDescription(dmDescription)
        .setTimestamp()
        await addEmbedFooter(client, dmEmbed);

    let logEmbed = new EmbedBuilder()
        .setColor(punishment.color)
        .setTitle(`A user has been been ${punishment.text.verb}`)
        .setDescription(logDescription)
        .setTimestamp()
        await addEmbedFooter(client, logEmbed);

    await sendDmEmbed(client, command.target, dmEmbed);
    await sendModLog(client, config, logEmbed);

    if (!command.duration) {
        command.duration = 1
    }
    
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
  
            if (recentInfractions.result.length + 1 == 2) {
                await memberTarget.timeout(1 * 3600000, command.reason); // 1 hour

            } else if(recentInfractions.result.length + 1 == 3 || recentInfractions.result.length + 1 == 4) {
                await memberTarget.timeout(24 * 3600000, command.reason); // 24 hours

            } else if (recentInfractions.result.length + 1 >= 5) {
                let durationTimestamp = await TempBanFile.genExpiration(168);
                await command.guild.members.ban(command.target.id, { reason: command.reason });
                TempBanFile.addMember(command.target.id, command.guild.id, durationTimestamp)
            }

            await InfractionsDB.addInfraction(command.target.id, ModerationAction.WARN, command.reason)

            break;

    }
}