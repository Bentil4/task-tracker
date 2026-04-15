import express from "express";
import { createTaskController } from "./controllers/taskController";
import { seedTasks } from "./data/seedTasks";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./middlewares/logger";
import { notFound } from "./middlewares/notFound";
import { InMemoryTaskRepository } from "./repositories/InMemoryTaskRepository";
import { createTaskRouter } from "./routes/taskRoutes";
import { DefaultTaskService } from "./services/TaskService";

const app = express();

const taskRepository = new InMemoryTaskRepository(seedTasks);
const taskService = new DefaultTaskService(taskRepository);
const taskController = createTaskController(taskService);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);

app.get("/", (_request, response) => {
  response.json({ success: true, message: "Task Tracker API is running" });
});

app.use("/api/tasks", createTaskRouter(taskController));

app.use(notFound);
app.use(errorHandler);

export default app;
