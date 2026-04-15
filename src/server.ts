import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port, () => {
  console.log("\nTask Tracker API");
  console.log(`Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`Listening on: http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/\n`);
});

const shutdown = (signal: string): void => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
