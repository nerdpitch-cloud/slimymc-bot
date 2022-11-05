import { ButtonStyle, EmbedBuilder, TextBasedChannel, ButtonBuilder, ActionRowBuilder, ButtonInteraction, TextChannel } from "discord.js";
import SlimyClient from "../../client"
import { verifyChannelId, verifyMessageId, verifyRoleId, recommendedChannels } from "../../conf/verify.json"
import { addEmbedFooter } from "../../lib/embed-footer";
import { promises as fsp } from "fs"

const verifyEmbed = new EmbedBuilder()
    .setColor(0xabf243)
    .setTitle("Verification")
    .setDescription("Click the button below to verify")

export async function checkVerifyMessage(client: SlimyClient) {
    if (!verifyMessageId) {
        let channel = await client.channels.fetch(verifyChannelId);
        if (channel instanceof TextChannel) {
            channel.bulkDelete(100);
            _sendVerifyMessage(client, channel);
        }
    }
    
}


async function _sendVerifyMessage(client: SlimyClient, channel: TextBasedChannel) {
    await addEmbedFooter(client, verifyEmbed);

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("verify")
                .setEmoji("📩")
                .setLabel("Click to verify!")
                .setStyle(ButtonStyle.Primary),
        );

    let message = await channel.send({ embeds: [verifyEmbed], components: [actionRow] });

    let conf = JSON.stringify({
        verifyChannelId: verifyChannelId,
        verifyMessageId: message.id
        },
        null,
        4
    )

    await fsp.writeFile(`${__dirname}/../conf/verify.json`, conf);

}

export async function handleVerifyButton(interaction: ButtonInteraction) {
    let member = await interaction.guild?.members.fetch(interaction.user.id);

    if (member) {
        if (member.roles.cache.some(role => role.id === verifyRoleId)) {
            interaction.reply({
                content: `You are already verified!`,
                ephemeral: true
            });
        }
        else {
            member.roles.add(verifyRoleId);
            interaction.reply({
                content: `Verified successfully, take a look at <#${recommendedChannels[0]}> & <#${recommendedChannels[1]}>`,
                ephemeral: true
            });
        }
    }
}