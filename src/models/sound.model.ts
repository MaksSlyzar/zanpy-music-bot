import { Schema, model, Document, Types } from "mongoose";

export interface ISound {
  id: string,
  name: string;
  from: "youtube";
  url: string;
  author: string;
  iconUrl: string;
  seconds: number;
  listenedTimes: number;
}

const SoundSchema = new Schema<ISound>({
  name: { type: String, required: true },
  from: { type: String, enum: ["youtube"], required: true },
  url: { type: String, required: true },
  author: { type: String, required: true },
  iconUrl: { type: String, required: true },
  seconds: { type: Number, required: true },
  listenedTimes: { type: Number, default: 0 },
});

export const Sound = model<ISound>("Sound", SoundSchema);

