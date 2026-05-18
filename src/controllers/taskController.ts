import { TaskModel } from "../models/Task";
import { HttpError } from "../utils/errors";
import { validate, sendSuccess, wrapAsync } from "../utils/helpers";
import { createSchema, updateSchema } from "../validators/taskValidator";

export const taskController = {
  getAllTasks: wrapAsync(async (_req, res) => {
    const tasks = await TaskModel.find().sort({ createdAt: -1 });
    sendSuccess(res, 200, tasks, "Tasks retrieved successfully.");
  }),

  getTaskById: wrapAsync(async (req, res) => {
    const { id } = req.params;
    const task = await TaskModel.findById(id);
    if (!task) throw new HttpError(404, `Task with ID ${id} not found.`);
    sendSuccess(res, 200, task, "Task retrieved successfully.");
  }),

  createTask: wrapAsync(async (req, res) => {
    const input = validate(createSchema, req.body);
    const task = await TaskModel.create(input);
    sendSuccess(res, 201, task, "Task created successfully.");
  }),

  updateTask: wrapAsync(async (req, res) => {
    const { id } = req.params;
    const input = validate(updateSchema, req.body);
    const task = await TaskModel.findByIdAndUpdate(id, input, {
      returnDocument: "after",
    });
    if (!task) throw new HttpError(404, `Task with ID ${id} not found.`);
    sendSuccess(res, 200, task, "Task updated successfully.");
  }),

  deleteTask: wrapAsync(async (req, res) => {
    const { id } = req.params;
    const task = await TaskModel.findByIdAndDelete(id);
    if (!task) throw new HttpError(404, `Task with ID ${id} not found.`);
    sendSuccess(res, 200, task, "Task deleted successfully.");
  }),
};
