import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./middlewares/logger";
import { notFound } from "./middlewares/notFound";
import taskRouter from "./routes/taskRoutes";
import userRouter from "./routes/userRoute";
import authRouter from "./routes/authRoutes";

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(logger);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Task Tracker API is running" });
});

app.use("/api/tasks", taskRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.use(notFound);
app.use(errorHandler);
export default app;
