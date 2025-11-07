import { ApplicationCommandOptionType } from "discord.js";
import Command from "../classes/command";
import PlayManager from "../managers/play-manager";

const playManager = PlayManager.getInstance();

export default {
  data: {
    name: "play",
    description: "Пошук треку",
    options: [
      { name: "payload", description: "Введіть назву трека або виконавця", type: ApplicationCommandOptionType.String }
    ]
  },
  async execute(interaction) {
    const payload = interaction.options.getString("payload");

    if (!payload) return;

    await interaction.deferReply();
    playManager.play(interaction, payload);
  },
} as Command;
