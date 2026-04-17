import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db";
import app from "./app";

const port = Number(process.env.PORT) || 3000;

connectDB().then(() => {
  const server = app.listen(port, () => {
    console.log("\nTask Tracker API");
    console.log(`Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`Listening on: http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/\n`);
  });

  const shutdown = (signal: string): void => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      console.log("HTTP server closed.");
      await import("mongoose").then((m) => m.default.connection.close());
      console.log("Database connection closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
});
