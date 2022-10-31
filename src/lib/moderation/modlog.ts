import { ChannelType, Client, EmbedBuilder } from "discord.js";
import { ModlogChannelId } from "../../conf/log.json";

export async function sendModLog(client:Client, embed: EmbedBuilder) {
    var modlogChannel = await client.channels.fetch(ModlogChannelId);

    if (modlogChannel) {
        if(modlogChannel.type == ChannelType.GuildText) {
            modlogChannel.send({ embeds: [embed] });
        }
    }
}
