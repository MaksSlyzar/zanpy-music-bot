import PlayManager from "../managers/play-manager";
import Command from "../classes/command";
import { ApplicationCommandOptionType, CommandInteractionOptionResolver } from "discord.js";

export default {
  data: {
    name: "save-playlist",
    description: "Команда для створення плейлисту",
    options: [
      { name: "name", description: "Назва", type: ApplicationCommandOptionType.String }
    ]
  },
  async execute(interaction) {
    const name = interaction.options.getString("name");
    if (!name) return;
    const playManager = PlayManager.getInstance();
    await playManager.savePlaylist(interaction, name);
  },
} as Command;
