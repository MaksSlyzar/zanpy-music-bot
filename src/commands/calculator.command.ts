import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import Command from "../classes/command";
import Calculator from "../core/calculator";

export default {
  data: {
    name: "calc",
    description: "Калькулятор",
    options: [{
      name: "prompt", description: "Напиши щось типу 2+2*(3 - 5)",
      type: ApplicationCommandOptionType.String
    }]
  },
  execute(interaction) {
    const prompt = interaction.options.getString("prompt");

    if (!prompt) return;

    try {
      const calculator = new Calculator();
      const output = calculator.run(prompt);
      interaction.reply(`\`\`${prompt}\`\`\nВивід ${output}`);
    } catch (e) {
      interaction.reply(`Помилка: не правильний символ.`);
    }
  },
} as Command;
