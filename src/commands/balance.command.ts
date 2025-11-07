import { getBotUser } from "@core/get-bot-user";
import Command from "../classes/command";
import { EmojieData } from "../core/emojie.data";

export default {
  data: {
    name: "bal",
    description: "Показує твої Shizik Coin"
  },
  async execute(interaction) {
    const user = await getBotUser(interaction.user);

    interaction.reply(`**У тебе на балансі:** \n<${EmojieData.shizik_coin}> ${Math.round(user.coins * 1000) / 1000}`);
  },
} as Command;
