import { User } from "discord.js"

export interface Sound {
  name: string,
  from: "youtube",
  url: string,
  author: string,
  iconUrl: string,
  addedBy: User,
  seconds: number,
};
