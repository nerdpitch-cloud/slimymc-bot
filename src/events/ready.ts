import SlimyClient from "../client";
import { loadErrorLogChannel } from "../lib/errors/handler";
import { CronJob } from "cron"
import { tempbanCheck } from "../lib/moderation/tempban";
import { initSQLPool } from "../lib/mysql/_base";
import { invitesInit } from "./guild/member-add";
import { promises as fsp } from "fs"
import { constants } from 'fs';
import { checkVerifyMessage } from "./buttons/verify";

export async function runReady(client: SlimyClient) {
    try {
        await fsp.access(`${__dirname}/../commands/tempbans.json`, constants.R_OK | constants.W_OK)
    } catch {
        await fsp.writeFile(`${__dirname}/../commands/tempbans.json`, "{}")
    }
    
    loadErrorLogChannel(client);
    checkVerifyMessage(client);
    initSQLPool();
    invitesInit(client)
    tempbanCheck(client);

    let job = new CronJob("*/15 * * * *", function() {
            tempbanCheck(client);
        },
        null,
        true
    );

    job.start()

    console.log("Ready!");
}