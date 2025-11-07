import { ApplicationCommandOptionType } from "discord.js";
import Command from "../classes/command";
import { env } from "../config/env";
import fs from "fs";

export default {
  data: {
    name: "commit-error",
    description: "Тут ти можеш поділитись помилкою",
    options: [
      { name: "error-str", description: "Опиши детально помилку, після чого вона сталась і т.д.", required: true, type: ApplicationCommandOptionType.String }
    ]
  },
  async execute(interaction) {
    const errorStr = interaction.options.getString("error-str");
    if (!errorStr) return;

    const logDate = new Date(Date.now()).toLocaleString();
    const log = `${logDate}:${errorStr}: ${interaction.user.displayName}\n\n`;

    let data = fs.readFileSync(env.ERROR_COMMITS_FILE, "utf8");

    data += log;

    fs.writeFileSync(env.ERROR_COMMITS_FILE, data);

    interaction.reply("Дякую, дані успішно збережено.");
  },
} as Command;
