import { TaskModel } from "../models/Task";
import { HttpError } from "../utils/errors";
import { validate, sendSuccess, wrapAsync } from "../utils/helpers";
import { createSchema, updateSchema, querySchema } from "../validators/taskValidator";

export const taskController = {
  getAllTasks: wrapAsync(async (req, res) => {
    const query = validate(querySchema, req.query);

    const filter: Record<string, unknown> = {};
    if (query.completed !== undefined) filter.completed = query.completed;
    if (query.search) filter.title = { $regex: query.search, $options: "i" };

    const sortBy = query.sortBy ?? "createdAt";
    const sortOrder = query.order === "asc" ? 1 : -1;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      TaskModel.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).lean(),
      TaskModel.countDocuments(filter).lean(),
    ]);

    sendSuccess(res, 200, { tasks, total, page, limit }, "Tasks retrieved successfully.");
  }),

  getTaskById: wrapAsync(async (req, res) => {
    const { id } = req.params;
    const task = await TaskModel.findById(id).lean();
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
