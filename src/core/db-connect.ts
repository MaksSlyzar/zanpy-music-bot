import mongoose from "mongoose";
import { env } from "../config/env";

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_DB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

