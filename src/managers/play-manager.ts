import { ButtonInteraction, ChatInputCommandInteraction, TextChannel } from "discord.js";
import PlayService from "./play-service";
import { getBotUser } from "@core/get-bot-user";

class PlayManager {
  private static instance: PlayManager;
  services: Record<string, PlayService> = {} // GuildId, PlayService

  public static getInstance() {
    if (!this.instance)
      this.instance = new PlayManager();
    return this.instance;
  }

  public async savePlaylist(interaction: ChatInputCommandInteraction, name: string) {
    // const user = await getShizikUser(interaction.user);
    // if (!interaction.guildId) return;
    //
    // const service = this.services[interaction.guildId];
    //
    // if (!service) return;
    //
    // const playlist = new Playlist({
    //   sounds: [...service.playList, ...service.historyList],
    //   name: name, createdAt: Date.now(),
    //   createdBy: user
    // });
    //
    // await interaction.reply(`Плейлист збережено, id: ${playlist.id}`);
    // await playlist.save();
  }

  public async play(interaction: ChatInputCommandInteraction, payload: string) {
    const guild = interaction.guild;
    const channel = interaction.channel;

    if (!guild || !channel) return;

    if (!this.services[guild.id]) this.services[guild.id] = new PlayService(channel as TextChannel, guild);

    const service = this.services[guild.id];

    const status = await service.start(interaction);

    if (status)
      service.play(interaction, payload);

    //TODO: catch errors
  }

  public async playLatest(interaction: ChatInputCommandInteraction) {
    const botUser = await getBotUser(interaction.user);
    const guild = interaction.guild;
    const channel = interaction.channel;

    if (!guild || !channel) return;

    const limitedUser = await botUser.populate({
      path: "historySounds",
      options: { sort: { _id: -1 }, limit: 10 }
    });

    if (!this.services[guild.id]) this.services[guild.id] = new PlayService(channel as TextChannel, guild);

    const service = this.services[guild.id];

    const status = await service.start(interaction);

    if (status)
      service.addSoundsFromDB(limitedUser.historySounds, interaction.user);
  }

  public skip(interaction: ChatInputCommandInteraction) {
    if (interaction.guildId === null) return;
    const service = this.services[interaction.guildId];
    if (service)
      service.skip();

    interaction.reply("Пропускаю трек, це повідомлення зникне через 5 секунд.").then(i => {
      setTimeout(() => i.delete(), 5000);
    });
  }

  public skipAll(interaction: ChatInputCommandInteraction) {
    if (interaction.guildId === null) return;
    const service = this.services[interaction.guildId];
    if (service)
      service.skipAll();

    interaction.reply("Пропускаю трек, це повідомлення зникне через 5 секунд.").then(i => {
      setTimeout(() => i.delete(), 5000);
    });
  }

  async buttonController(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;

    const service = this.services[interaction.guildId];
    service.buttonClick(interaction);
  }
}

export default PlayManager;
