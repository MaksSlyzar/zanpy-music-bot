import { ApplicationCommandDataResolvable, ApplicationCommandOption, ApplicationCommandOptionData, ChatInputApplicationCommandData, ChatInputCommandInteraction, GuildManager, SlashCommandBuilder } from "discord.js";

interface Command {
  data: {
    name: string,
    options: ApplicationCommandOptionData[],
    description: string
  };

  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export default Command;
