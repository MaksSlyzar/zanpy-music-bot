import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, Guild, GuildMember, Message, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, User, VoiceBasedChannel } from "discord.js";
import { Result } from "./GuildManager";
import { AudioPlayer, createAudioResource, joinVoiceChannel, StreamType, VoiceConnection } from "@discordjs/voice";
import yts, { VideoMetadataResult, VideoSearchResult } from "yt-search";
import { YtDlp } from "ytdlp-nodejs";
import { PassThrough } from "stream";
import { spawn } from "child_process";
import { logSystemError } from "../logs/add-log";
import { EmojieData } from "../core/emojie.data";
import BalanceService from "./balance-service";
import { getYoutubeVideoId, isYoutubeUrl } from "../core/is-url";
import { formatTime } from "../core/format-time";
import type { Sound } from "types/sound";
import { getSaveSound } from "@core/save-sound";
import { getBotUser } from "@core/get-bot-user";
import { ISound } from "@models/sound.model";

const balanceService = BalanceService.getInstance();

class PlayService {
  voiceChannel: VoiceBasedChannel | null = null;
  guild: Guild;
  playList: Sound[] = [];
  playIndex: number = 0;
  message: Message | null = null;
  channel: TextChannel;
  isActive: boolean = false;
  isPlaying: boolean = false;
  player: AudioPlayer;
  connection: VoiceConnection | null = null;
  currentPass: PassThrough | null = null;
  currentFfmpeg: ReturnType<typeof spawn> | null = null;
  ytdlp: YtDlp = new YtDlp();
  lastTimePlayed: number | null = null;
  historyList: Sound[] = [];
  activity: "MUSIC" | "TURN" = "MUSIC";

  constructor(channel: TextChannel, guild: Guild) {
    this.channel = channel;
    this.guild = guild;

    this.player = new AudioPlayer();

    this.player.on('stateChange', async (oldState, newState) => {
      if (oldState.status !== newState.status) {
        this.generateMessage();
      }

      if (newState.status === 'idle') {
        this.isPlaying = false;
        if (this.lastTimePlayed !== null) {
          const coins = this.convertTimeToCoins();

          const sound = await getSaveSound(this.peek());

          sound.listenedTimes++;
          sound.save();

          if (this.voiceChannel && coins) {
            this.voiceChannel.members.map(m => {
              balanceService.addBalance(m.user, coins);
            })
          }
        }

        if (this.playList.length >= this.playIndex) {
          if (this.playIndex === 10) {
            this.historyList.push(...this.playList.splice(0, 10));
            this.playIndex = 0;
          } else {
            this.playIndex++;
          }

          this.isPlaying = false;
          this.joinAndPlay();
          this.generateMessage();
        }
      }
    });

  }

  peek() {
    return this.playList[this.playIndex] ?? null;
  }

  private convertTimeToCoins() {
    if (this.lastTimePlayed === null) return null;

    const seconds = (Date.now() - this.lastTimePlayed) / 1000;
    const coins = seconds * 0.001;

    return coins;
  }

  async send(): Promise<Result<Message>> {
    if (!this.channel) {
      return { ok: false, message: "Don't have channel" };
    }

    const msg = await this.channel.send({ content: "." });
    this.message = msg;
    this.generateMessage();

    return { ok: true, data: msg };
  }

  async generateMessage() {
    const { playList, playIndex, activity, message } = this;

    const MAX_TRACKS_DISPLAY = 15;
    const totalTracks = playList.length;
    const nowPlaying = this.peek();
    const nextTrack = playList[playIndex + 1];
    const nothingTodo = !nowPlaying;

    const visibleTracks = playList.slice(0, MAX_TRACKS_DISPLAY);
    const soundsList = visibleTracks
      .map((s, i) => {
        const prefix = i === playIndex ? EmojieData.play : EmojieData.diamond1;
        const bold = i === playIndex ? "**" : "";
        return `${i === playIndex ? `<${prefix}>${bold}` : `<${prefix}>`} ${s.name}: ${s.author}${bold}`;
      })
      .join("\n");

    const extraTracks =
      totalTracks > MAX_TRACKS_DISPLAY
        ? `\n\n_…та ще **${totalTracks - MAX_TRACKS_DISPLAY}** треків_`
        : "";

    const embed = new EmbedBuilder()
      .setColor(0x00ffff)
      .setDescription("Nothing todo...");

    if (!nothingTodo) {
      embed
        .setURL(nowPlaying.url)
        .setTitle(nowPlaying.name)
        .setThumbnail(nowPlaying.iconUrl)
        .setAuthor({
          name: nowPlaying.addedBy.displayName,
          iconURL: nowPlaying.addedBy.avatarURL() ?? nowPlaying.iconUrl,
        });
    }

    const row = new ActionRowBuilder<ButtonBuilder>();

    switch (activity) {
      case "TURN": {
        embed.setDescription(soundsList + extraTracks);

        row.addComponents(
          new ButtonBuilder()
            .setCustomId("change-window")
            .setLabel("Player")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("sound-skip")
            .setLabel("Skip")
            .setStyle(ButtonStyle.Danger)
        );
        break;
      }

      case "MUSIC": {
        if (nothingTodo) {
          embed.setDescription("Nothing todo...\nДодай музику через **/play**");
        } else {
          const time = formatTime(nowPlaying.seconds);
          const statusInfo = this.getPlayStatusInfo();

          embed.setDescription(`**Next:** ${nextTrack ? nextTrack.name : "Пусто"}`);

          embed.addFields(
            {
              name: `<${EmojieData.hourglass}> Час`,
              value: `${time.hours}h ${time.minutes}m ${time.seconds}s`,
              inline: true,
            },
            {
              name: `<${EmojieData.diamond2}> Канал`,
              value: nowPlaying.author,
              inline: true,
            },
            {
              name: `<${EmojieData.diamond1}> Статус`,
              value: statusInfo,
              inline: true,
            }
          );
        }

        row.addComponents(
          new ButtonBuilder()
            .setCustomId("change-window")
            .setLabel("Turn")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("sound-skip")
            .setLabel("Skip")
            .setStyle(ButtonStyle.Danger)
        );
        break;
      }

      default: {
        embed.setDescription("Nothing to display");
        break;
      }
    }

    if (message) {
      console.log("Edititng")
      await message.edit({ embeds: [embed], components: [row] });
    }
  }

  getPlayStatusInfo() {
    switch (this.player.state.status) {
      case "autopaused":
        return "Призупинено";
      case "buffering":
        return "Завантаження";
      case "idle":
        return "Нічого не роблю";
      case "paused":
        return "Призупинено";
      case "playing":
        return "Співаю";
      default:
        return "Хз, хз...";
    }
  }

  public async buttonClick(interaction: ButtonInteraction) {
    const customId = interaction.customId;

    switch (customId) {
      case "change-window":
        this.activity = this.activity === "TURN" ? "MUSIC" : "TURN";
        this.generateMessage();
        interaction.deferUpdate();
        break;
      case "sound-skip":
        this.skip();
        interaction.deferUpdate();
        break;
    }
  }

  public async start(interaction: ChatInputCommandInteraction) {
    if (this.isActive) return true;

    const sendingMessage = await this.send();

    if (sendingMessage.ok === false)
      return sendingMessage;

    this.message = sendingMessage.data;

    const voiceChannel = this.getUserVoiceChannel(interaction);

    if (!voiceChannel) {
      interaction.reply("Зайди в войс")
      return false;
    }
    this.voiceChannel = voiceChannel;
    this.isActive = true;

    return true;
  }

  public async play(interaction: ChatInputCommandInteraction, payload: string) {
    if (!this.isActive) return;

    setImmediate(async () => {
      try {
        if (isYoutubeUrl(payload)) {
          await this.addTrackByUrl(interaction, payload);
        } else {
          await this.createInteraction(interaction, payload);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  async addTrackByUrl(interaction: ChatInputCommandInteraction, url: string) {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return;

    const video = await yts.search({ videoId: videoId });

    if (!video) return;

    this.addSoundFromYoutube(video, interaction.user);
    const i = await interaction.editReply(`Добавлено`);
    setTimeout(() => i.delete(), 2000);
  }

  public async createInteraction(interaction: ChatInputCommandInteraction, payload: string) {
    try {
      const promis = await yts.search(payload);

      const data = promis.videos.slice(0, 16);

      if (data.length === 0)
        return interaction.reply(`Can't found your track ${payload}`);

      const options = data.map((d, i) => new StringSelectMenuOptionBuilder()
        .setLabel(d.title.slice(0, 52))
        .setValue(`${i}`)
        .setDescription(`${d.author.name}`)
        .setEmoji(i % 2 === 0 ? EmojieData.diamond1 : EmojieData.diamond2));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`selector_1`)
        .setPlaceholder("Виберіть трек")
        .setOptions(options)

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      const i = await interaction.editReply({ content: `Вибери трек знизу по запиту **${payload}**\nЦе повідомлення зникне через 3 хвилини.`, components: [row] });

      const collector = i.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 178_000
      });

      const mainInteraction = i;

      collector.on("collect", async (i) => {
        const selection = i.values[0];
        const choosed = data[Number(selection)];

        i.deferUpdate();
        if (!choosed) return;

        this.addSoundFromYoutube(choosed, i.user);
      });

      collector.on("end", async (i) => {
        mainInteraction.delete();
      })
    } catch (err) {
      console.log(err);
      logSystemError(String(err));
      interaction.editReply("Помилка, записав в логи. Для швидкого відлагодження опиши помилку в: /commit-error <error>");
    }
  }

  async addSoundsFromDB(data: ISound[], user: User) {
    const sounds: Sound[] = data.map(s => {
      return {
        name: s.name,
        author: s.author,
        from: s.from,
        iconUrl: s.iconUrl,
        url: s.url,
        seconds: s.seconds,
        addedBy: user,
      }
    });

    this.playList.push(...sounds);

    this.generateMessage();

    if (this.isPlaying === false)
      this.joinAndPlay();
  }

  async addSoundFromYoutube(data: VideoSearchResult | VideoMetadataResult, user: User) {
    const sound: Sound = {
      name: data.title,
      author: data.author.name,
      from: "youtube",
      iconUrl: data.thumbnail ?? "null",
      url: data.url,
      addedBy: user,
      seconds: data.seconds
    };

    getSaveSound(sound).then(async (data) => {
      const botUser = await getBotUser(user);

      botUser.historySounds.push(data);
      await botUser.save();
    });

    this.playList.push(sound);

    this.generateMessage();

    if (this.isPlaying === false)
      this.joinAndPlay();
  }

  getUserVoiceChannel(interaction: ChatInputCommandInteraction): VoiceBasedChannel | null {
    if (!interaction.guild) return null;

    const member = interaction.member as GuildMember | null;
    if (!member) return null;

    const voiceChannel = member.voice.channel;
    return voiceChannel ?? null;
  }

  async makeConnection() {
    if (this.voiceChannel === null) return null;

    this.connection = joinVoiceChannel({
      channelId: this.voiceChannel.id,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    this.connection.subscribe(this.player);

    return this.connection;
  }

  public skip() {
    try {
      if (this.currentPass) {
        this.currentPass.end();
        this.currentPass = null;
      }
      this.player.stop();
    } catch (err) {
      console.warn('Player stop error:', err);
    }
  }

  public skipAll() {
    this.playIndex = this.playList.length;
    this.skip();
  }

  async joinAndPlay() {
    if (this.playList.length === 0) return;
    if (this.voiceChannel === null) return;

    if (this.connection === null) await this.makeConnection();

    const sound = this.playList[this.playIndex];

    if (!sound) return;

    await this.setupSound(sound);
  }

  async setupSound(sound: Sound) {
    const stream = this.ytdlp.stream(`${sound.url}`,
      {
        format: "bestaudio[ext=webm][acodec=opus]/bestaudio",
        // cookies: "/home/undefined/Projects/shizik-bot/cookies.txt",
        noCookies: false,
        ageLimit: 18,
      });

    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-f', 's16le',
      '-ar', '48000',
      '-ac', '2',
      'pipe:1',
    ]);

    stream.pipe(ffmpeg.stdin);

    this.currentFfmpeg = ffmpeg;

    const resource = createAudioResource(ffmpeg.stdout, { inputType: StreamType.Raw });

    this.player.play(resource);

    this.isPlaying = true;
    this.lastTimePlayed = Date.now();

    process.on('uncaughtException', (err) => {
      if (err.name === 'EPIPE') return;
    });

    await stream.promise;
  }
}

export default PlayService;


