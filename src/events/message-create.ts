import { Message } from "discord.js";
import { channel } from "node:diagnostics_channel";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { CountingDB } from "../lib/mysql/counting";
import { LevelsDB } from "../lib/mysql/levels";
import { VariablesDB } from "../lib/mysql/variables";
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

    let addXp = true
    if (userCache.includes(message.author.id) || message.author.bot || config.levels.ignoredChannels.includes(message.channelId)) addXp = false;

    if (addXp) {
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

    if (message.channelId == config.counting.channelId) {
        let latestCount = Number(await VariablesDB.get("latestCount"))

        if (!latestCount) {
            await VariablesDB.set("latestCount", 0)
            latestCount = 0
        }

        let lastMsg = (await message.channel.messages.fetch({ limit: 2})).at(1)

        if (Number(latestCount) + 1 === Number(message.content) && message.author !== lastMsg?.author) {
            await VariablesDB.set("latestCount", Number(latestCount) + 1)
            await CountingDB.addCount(message.author.id)
        } else {
            return message.delete()
        }
    }
}