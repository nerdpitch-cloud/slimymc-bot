import { createAudioPlayer, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";
import { VoiceChannel } from "discord.js";
import play, { YouTubeVideo } from "play-dl";
export let queue: YouTubeVideo[] = [];

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

export async function formatVideoDuration(duration: number) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration - minutes * 60;
    return `${minutes}:${seconds}`;

}

export async function addTracktoQueue(songName: YouTubeVideo) {
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