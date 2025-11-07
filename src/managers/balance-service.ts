import { getBotUser } from "@core/get-bot-user";
import { User } from "discord.js";

type ShizUser = {
  user: User,
  coins: number,
  listenTime: number,
};

class BalanceService {
  private static instance: BalanceService;
  users: Record<string, ShizUser> = {} // userid, ShizUser

  public static getInstance() {
    if (!BalanceService.instance)
      BalanceService.instance = new BalanceService();

    return BalanceService.instance;
  }

  async addBalance(user: User, count: number) {
    const botUser = await getBotUser(user);

    botUser.coins += count;
    await botUser.save();

    console.log(`User ${user.displayName} got ${count} coins, he has ${botUser.coins}`);
  }

  getUser(user: User): ShizUser {
    if (!this.users[user.id])
      this.users[user.id] = {
        user: user,
        listenTime: 0,
        coins: 0
      };

    return this.users[user.id];
  }
}

export default BalanceService;
