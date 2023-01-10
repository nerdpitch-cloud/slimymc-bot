import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, inlineCode, SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel, createAudioResource , createAudioPlayer, NoSubscriberBehavior, VoiceConnectionStatus, entersState, AudioPlayer, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import play from 'play-dl'; // Everything
import SlimyClient from "../client";
import { Config } from "../conf/config";
import { Command } from "./_handle";
import { addEmbedFooter } from "../lib/embed-footer";
import { addTracktoQueue, formatVideoDuration, getQueue, initAudioPlayer, initVoiceConnection } from "../lib/music";

let player: AudioPlayer | null = null;
let connection: VoiceConnection | null = null;

export class MusicCommand implements Command {
    name = "🎵 Music"
    description = "Music commands"
    syntax = "music <play|pause|resume|stop|queue>"
    data = new SlashCommandBuilder()
        .setName("music")
        .setDescription("Music commands")
        .addSubcommand((subcommand) => subcommand
            .setName("play")
            .setDescription("Play a song")
            .addStringOption((option) => option
                .setName("song")
                .setDescription("Youtube link or song name")
                .setRequired(true)))

        .addSubcommand((subcommand) => subcommand
            .setName("pause")
            .setDescription("Pause the current song"))

        .addSubcommand((subcommand) => subcommand
            .setName("resume")
            .setDescription("Resume the current song"))

        .addSubcommand((subcommand) => subcommand
            .setName("stop")
            .setDescription("Stop the current song"))

        .addSubcommand((subcommand) => subcommand
            .setName("queue")
            .setDescription("Show the current queue"))
        
        .setDMPermission(false)
    
    async execute(client: SlimyClient, config: Config, interaction: ChatInputCommandInteraction) {
        const subCommand = interaction.options.getSubcommand();
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel || voiceChannel.type === ChannelType.GuildStageVoice) {
            await interaction.reply({ content: "You need to be in a voice channel to play music!", ephemeral: true });
            return;
        }


        switch (subCommand) {
            case "play": {
                await interaction.deferReply()
                const songArg = interaction.options.getString("song", true);

                if (!connection) {
                    connection = await initVoiceConnection(voiceChannel);
                }

                const video = (await play.search(songArg, { limit: 1 }))[0];


                if ((await getQueue()).length > 0 || player?.state.status === AudioPlayerStatus.Playing) {
                    await addTracktoQueue(video);
                    await interaction.editReply({ content: `Added ${video.title} to the queue!` })
                    return;
                }


                const embed = new EmbedBuilder()
                    .setTitle("🎵 Music")
                    .setDescription(`**Now playing:** ${video.title} - ${inlineCode(await formatVideoDuration(video.durationInSec))}`)
                    .setColor(0x77b94d)
                    .setTimestamp()
                    await addEmbedFooter(client, embed)

                await interaction.editReply({ embeds: [embed] })
            
                const stream = await play.stream(video.url)

                const resource = createAudioResource(stream.stream, {
                    inputType: stream.type
                })
                
                if (!player) {
                    player = await initAudioPlayer()
                }

                player.play(resource)
                connection.subscribe(player)

                break;
            }
                
            case "pause": {
                if (!player) {
                    await interaction.reply({ content: "There is no song playing!", ephemeral: true });
                    return;
                }

                player.pause();

                await interaction.reply("⏸️ Paused the current song!");
                break;
            }
            case "resume": {
                if (!player) {
                    await interaction.reply({ content: "There is no song playing!", ephemeral: true });
                    return;
                }

                player.unpause();

                await interaction.reply("▶️ Resumed the current song!");
                break;
            }
            case "stop":
                if (!player) {
                    await interaction.reply({ content: "There is no song playing!", ephemeral: true });
                    return;
                }

                player.stop();
                connection?.destroy();
                player = null;
                connection = null;

                await interaction.reply("⏹️ Stopped the player");
                break;
            case "queue": {
                const queue = await getQueue();

                if (queue.length === 0) {
                    await interaction.reply({ content: "The queue is empty!", ephemeral: true });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setTitle("🎵 Music")
                    .setColor(0x77b94d)
                    .setDescription(`**Current queue:**\n${queue.map((video, index) => `**${index + 1}** • ${video.title}`).join("\n")}`)
                    .setTimestamp()
                    await addEmbedFooter(client, embed)

                await interaction.reply({ embeds: [embed] });
            }
        }
    }

}