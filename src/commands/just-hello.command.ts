import Command from "../classes/command";
import { ChatInputCommandInteraction } from "discord.js";

export default {
  data: {
    name: "hello",
    description: "Blabla"
  },
  async execute(interaction: ChatInputCommandInteraction) {
    interaction.reply("testing command successfully works");
  },
} as Command;
