import { createAudioPlayer, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";
import { VoiceChannel } from "discord.js";

export let queue: string[] = [];

export async function initAudioPlayer() {
    return await createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    })
}

export async function initVoiceConnection(voiceChannel: VoiceChannel) {
    return await joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
    })
}

export async function addTracktoQueue(songName: string) {
    queue.push(songName);
}

export async function removeTrackFromQueue() {
    queue.shift();
}

export async function clearQueue() {
    queue = [];
}

export async function getQueue() {
    return queue;
}