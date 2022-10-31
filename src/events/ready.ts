import SlimyClient from "../client";
import { loadErrorLogChannel } from "../lib/errors/handler";
import { checkVerifyMessage } from "../lib/verify";

export async function runReady(client: SlimyClient) {
    loadErrorLogChannel(client);
    checkVerifyMessage(client);
    console.log("Ready!");
}