import mongoose from "mongoose";

const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_PASSWORD) {
  throw new Error("DB_PASSWORD environment variable is not defined");
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb://admin:${encodeURIComponent(DB_PASSWORD)}@ac-gjn45zy-shard-00-00.ym4inbi.mongodb.net:27017,ac-gjn45zy-shard-00-01.ym4inbi.mongodb.net:27017,ac-gjn45zy-shard-00-02.ym4inbi.mongodb.net:27017/?ssl=true&replicaSet=atlas-c0z5yu-shard-0&authSource=admin&appName=Task-Tracker-Cluster`;

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

