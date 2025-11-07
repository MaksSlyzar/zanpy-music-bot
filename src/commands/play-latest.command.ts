import Command from "@classes/command";
import PlayManager from "@managers/play-manager";

const playManager = PlayManager.getInstance();

export default {
  data: {
    name: "play-latest",
    description: "Грати останні 10 треків які ви слухали",
  },
  execute(interaction) {
    playManager.playLatest(interaction);
  },
} as Command;
