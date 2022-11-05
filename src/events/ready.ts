import SlimyClient from "../client";
import { loadErrorLogChannel } from "../lib/errors/handler";
import { checkVerifyMessage } from "../lib/verify";
import { CronJob } from "cron"
import { tempbanCheck } from "../lib/moderation/tempban";
import { initSQLPool } from "../lib/mysql/_base";

export async function runReady(client: SlimyClient) {
    loadErrorLogChannel(client);
    checkVerifyMessage(client);
    initSQLPool();
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