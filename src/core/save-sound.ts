import { Sound } from "types/sound";
import { Sound as SoundModel } from "@models/sound.model";

export async function getSaveSound(sound: Sound) {
  const { from, name, url, iconUrl, author, addedBy, seconds } = sound;
  let dbSound = await SoundModel.findOne({ name: sound.name });

  if (!dbSound) {
    dbSound = new SoundModel({ from, name, url, iconUrl, author, seconds });
    await dbSound.save();
  }

  return dbSound;
}
