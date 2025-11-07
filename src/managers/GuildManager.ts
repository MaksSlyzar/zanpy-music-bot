import * as Discord from "discord.js";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

class GuildManager {
  private static instance: GuildManager;
  private guilds: Record<string, Discord.Guild> = {};

  public static getInstance() {
    if (!GuildManager.instance)
      GuildManager.instance = new GuildManager();
    return GuildManager.instance;
  }

  public async updateGuilds(guilds: Discord.Guild[]) {
    for (let discordGuild of guilds) {
      this.guilds[discordGuild.id] = discordGuild;
      console.log(`Guild ${discordGuild.name}, ${discordGuild.id} active`);

      // let guild = await Guild.findOne({ discordId: discordGuild.id });
      //
      // if (!guild) {
      //   guild = await Guild.create({
      //     discordId: discordGuild.id,
      //     name: discordGuild.name,
      //     callers: [],
      //     raidChannelId: null
      //   });
      //
      //   await guild.save();
      // }

      // this.callerGuildRoles[discordGuild.id] = guild.callerRoleId;
      // this.raidChannels[discordGuild.id] = guild.raidChannelId;
    }
  }

  public getGuils() {
    return this.guilds;
  }
}

export default GuildManager;
