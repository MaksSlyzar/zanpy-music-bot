import Command from "../classes/command";
import PlayManager from "../managers/play-manager";

const playManager = PlayManager.getInstance();

export default {
  data: {
    name: "skip",
    description: "Команда для пропуску треку"
  },
  execute(interaction) {
    playManager.skip(interaction);
  },
} as Command;
