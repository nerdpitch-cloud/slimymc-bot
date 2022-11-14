import { ChannelType, Client, EmbedBuilder } from "discord.js";
import { Config } from "../../conf/config";

export async function sendModLog(client:Client, config: Config, embed: EmbedBuilder) {
    var modlogChannel = await client.channels.fetch(config.log.modlogChannelId);

    if (modlogChannel) {
        if(modlogChannel.type == ChannelType.GuildText) {
            modlogChannel.send({ embeds: [embed] });
        }
    }
}
