import mongoose from "mongoose";

const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_PASSWORD) {
  throw new Error("DB_PASSWORD environment variable is not defined");
}

const MONGODB_URI =
  process.env.MONGODB_URI || `mongodb://localhost:27017/task-tracker`;

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
