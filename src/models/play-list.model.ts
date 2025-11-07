import { Schema, model, Document, Types } from "mongoose";
import { ISound } from "./sound.model";
import { IBotUser } from "./bot-user.model";

export interface IPlaylist extends Document {
  name: string;
  description?: string;
  sounds: ISound[];
  createdBy: Types.ObjectId | IBotUser;
  createdAt: Date;
}

const PlaylistSchema = new Schema<IPlaylist>({
  name: { type: String, required: true },
  description: { type: String },
  sounds: [{ type: Schema.Types.ObjectId, ref: "Sound" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "ShizikUser", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Playlist = model<IPlaylist>("Playlist", PlaylistSchema);

