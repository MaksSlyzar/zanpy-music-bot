import { BotUser, IBotUser } from "@models/bot-user.model";
import { User } from "discord.js";

export async function getBotUser(user: User): Promise<IBotUser> {
  let botUser = await BotUser.findOne({ discordId: user.id });

  if (!botUser) {
    botUser = new BotUser({ discordId: user.id, nickname: user.globalName });

    await botUser.save();
  }

  return botUser;
}

export async function getBotUserByDiscordId(userId: string): Promise<IBotUser | null> {
  const botUser = await BotUser.findOne({ discordId: userId });
  return botUser;
}
