import { Document, model, Schema } from "mongoose";
import { ISound } from "./sound.model";

export interface IBotUser extends Document {
  discordId: string,
  coins: number,
  nickname: string,
  historySounds: ISound[],
  favorite: ISound[]
};

const BotUserSchema = new Schema<IBotUser>({
  discordId: { type: String, required: true },
  coins: { type: Number, default: 0 },
  nickname: { type: String, required: true },
  historySounds: [{ type: Schema.Types.ObjectId, ref: "Sound" }],
  favorite: [{ type: Schema.Types.ObjectId, ref: "Sound" }]
});

export const BotUser = model<IBotUser>("BotUser", BotUserSchema);
