import Command from "../classes/command";
import PlayManager from "../managers/play-manager";

const playManager = PlayManager.getInstance();

export default {
  data: {
    name: "skip-all",
    description: "Команда для пропуску всіх треків"
  },
  execute(interaction) {
    playManager.skipAll(interaction);
  },
} as Command;

