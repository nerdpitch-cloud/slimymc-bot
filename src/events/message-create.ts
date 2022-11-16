import { Message } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { LevelsDB } from "../lib/mysql/levels";
import { VariablesDB } from "../lib/mysql/variables";
import { refreshDbVariables } from "../lib/variables";
import { checkLevelUp, xpToLevel } from "../lib/xp";

var userCache: Array<string> = []


interface MessageMultiplier {
    expires: Date
    value: number
}

export var messageMultiplier: MessageMultiplier = {
    expires: new Date(),
    value: 1
}

export async function handleMessageCreate(client: SlimyClient, config: Config, message: Message) {
    if (messageMultiplier.expires < new Date() && messageMultiplier.value !== 1) {
        await VariablesDB.set("xp_multiplier", `{"expires": ${Math.round(new Date().getTime() / 1000)}, "value": 1}`)
    }

    if (userCache.includes(message.author.id) || message.author.bot) return;
    if (config.levels.ignoredChannels.includes(message.channelId)) return;

    userCache.push(message.author.id);

    setTimeout(
        function() {
            userCache = userCache.filter(item => item !== message.author.id)
        }, 
        60000
    );
    
    let oldXp = await LevelsDB.getXp(message.author.id)
    let messageXp =  (Math.floor(Math.random() * (15 - 10 + 1)) + 10) * messageMultiplier.value;

    if (oldXp && await checkLevelUp(oldXp, oldXp + messageXp)) {
        let lvl = await xpToLevel(oldXp + messageXp)

        if (lvl !== -1 && lvl % 5 === 0 && lvl >= 10) {
            if (lvl !== 10) {
                message.member?.roles.remove(config.levels.roles[String(lvl-5)])
            }

            message.member?.roles.add(config.levels.roles[String(lvl)])
        }
    }

    LevelsDB.addXp(message.author.id, messageXp);
}