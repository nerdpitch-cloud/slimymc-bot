import SlimyClient from "../client";
import { loadErrorLogChannel } from "../lib/errors/handler";
import { checkVerifyMessage } from "../lib/verify";
import { CronJob } from "cron"
import { tempbanCheck } from "../lib/moderation/tempban";

export async function runReady(client: SlimyClient) {
    loadErrorLogChannel(client);
    checkVerifyMessage(client);
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