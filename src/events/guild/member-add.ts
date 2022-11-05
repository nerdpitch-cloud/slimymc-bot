import { Collection, EmbedBuilder, Guild, GuildMember, inlineCode, Invite, Snowflake, time } from "discord.js";
import SlimyClient from "../../client";
import { InviteLogsId } from "../../conf/log.json"
import { guildId } from "../../conf/discord.json"
import { addEmbedFooter } from "../../lib/embed-footer";

type UserInviteCollection = Collection<Snowflake, Collection<string, number | null>>
let invites: UserInviteCollection = new Collection();

export async function invitesInit(client: SlimyClient) {
    let guild = await client.guilds.fetch(guildId)
    let firstInvites = await guild.invites.fetch();
    invites.set(guild.id, new Collection(firstInvites.map((invite) => [invite.code, invite.uses])));
}
export async function handleInviteCreate(invite: Invite) {
    if (!invite.guild) throw new Error("invite.guild was null");

    invites.get(invite.guild.id)?.set(invite.code, invite.uses);
}

export async function handleInviteDelete(invite: Invite) {
    if (!invite.guild) throw new Error("invite.guild was null");
    
    invites.get(invite.guild.id)?.delete(invite.guild.id)
}

async function getUsedInvite(newInvites: Collection<string, Invite>, oldInvites: Collection<string, number | null> | undefined): Promise<Invite | void> {
    for (let [key, newInvite] of newInvites) {
        if (newInvite.uses == null) throw new Error("newInvite.uses was null");
        if (!oldInvites) throw new Error ("oldInvites was null");

        let oldInviteUses = oldInvites.get(newInvite.code)

        if (oldInviteUses == null) throw new Error("oldInviteUses was null")

        if (newInvite.uses > oldInviteUses) {
            return newInvite;
        }
    }
}

export async function handleMemberAdd(client: SlimyClient, member: GuildMember) {
    let usedInvite = await getUsedInvite(await member.guild.invites.fetch(), invites.get(member.guild.id));
    if (!usedInvite) throw new Error("usedInvite was null");

    let inviteLogChannel = await member.guild.channels.fetch(InviteLogsId);
    if (!inviteLogChannel?.isTextBased()) throw new Error ("inviteLogChannel was not text based") ;

    let inviteLogEmbed = new EmbedBuilder()
        .setColor(0x53ddad)
        .setTitle("Member joined")
        .setAuthor( {name: member.user.tag, iconURL: member.displayAvatarURL()} )
        .setTimestamp()
        .setFooter( {text: `ID - ${member.user.id}`})


    if (usedInvite.inviter) {
        inviteLogEmbed.setDescription(`<@${member.user.id}> joined using invite code ${inlineCode(usedInvite.code)} (${usedInvite.uses} uses) from <@${usedInvite.inviter.id}>\nAccount created ${time(member.user.createdAt, "F")}`)
    } else {
        inviteLogEmbed.setDescription(`<@${member.user.id}> joined using invite code ${inlineCode(usedInvite.code)} from <not found>\nAccount created ${time(member.user.createdAt, "F")}`)
    }

    await inviteLogChannel.send({ embeds: [inviteLogEmbed] })
}