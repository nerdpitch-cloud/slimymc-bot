import { Message } from "discord.js";
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { LevelsDB } from "../lib/mysql/levels";
import { checkLevelUp, xpToLevel } from "../lib/xp";

var userCache: Array<string> = []

export async function handleMessageCreate(client: SlimyClient, config: Config, message: Message) {
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
    let messageXp =  Math.floor(Math.random() * (15 - 10 + 1)) + 10;

    if (oldXp && await checkLevelUp(oldXp, oldXp + messageXp)) {
        console.log("lvl up")
        let lvl = await xpToLevel(oldXp + messageXp)
        console.log(lvl)
        if (lvl !== -1 && lvl % 5 === 0 && lvl >= 10) {
            console.log("yes thus")
            if (lvl !== 10) {
                console.log("removing role")
                message.member?.roles.remove(config.levels.roles[String(lvl-5)])
            }

            message.member?.roles.add(config.levels.roles[String(lvl)])
        }
    }

    LevelsDB.addXp(message.author.id, messageXp);
}