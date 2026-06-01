import { Types } from "mongoose";
import { TaskModel } from "../models/Task.model";
import { validate, sendSuccess, wrapAsync } from "../utils/helper";
import { HttpError } from "../utils/errors";
import {
  createSchema,
  updateSchema,
  querySchema,
} from "../validators/taskValidator";
import { UserRole } from "../types/user";
import { escapeRegExp } from "../utils/sanitizeInput";

export const taskController = {
  getAllTasks: wrapAsync(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    const query = validate(querySchema, req.query);

    const filter: Record<string, unknown> = {};
    if (req.user.role !== UserRole.ADMIN) filter.userId = req.user.id;
    if (query.completed !== undefined) filter.completed = query.completed;
    if (query.search) filter.title = { $regex: escapeRegExp(query.search), $options: "i" };

    const sortBy = query.sortBy ?? "createdAt";
    const sortOrder = query.order === "asc" ? 1 : -1;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      TaskModel.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      TaskModel.countDocuments(filter),
    ]);

    sendSuccess(
      res,
      200,
      { tasks, total, page, limit },
      "Tasks retrieved successfully.",
    );
  }),

  getTaskById: wrapAsync(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    const { id } = req.params;
    const task = await TaskModel.findById(id).lean();
    if (!task) throw new HttpError(404, `Task with ID ${id} not found.`);

    if (
      req.user.role !== UserRole.ADMIN &&
      task.userId.toString() !== req.user.id
    ) {
      throw new HttpError(
        403,
        "Access denied: You can only access your own tasks.",
      );
    }

    sendSuccess(res, 200, task, "Task retrieved successfully.");
  }),

  createTask: wrapAsync(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    const input = validate(createSchema, req.body);
    const task = await TaskModel.create({
      ...input,
      userId: new Types.ObjectId(req.user.id),
    });
    sendSuccess(res, 201, task, "Task created successfully.");
  }),

  updateTask: wrapAsync(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    const { id } = req.params;
    const input = validate(updateSchema, req.body);

    const existingTask = await TaskModel.findById(id);
    if (!existingTask)
      throw new HttpError(404, `Task with ID ${id} not found.`);

    // Check ownership: users can only update their own tasks, admins can update all
    if (
      req.user.role !== UserRole.ADMIN &&
      existingTask.userId.toString() !== req.user.id
    ) {
      throw new HttpError(
        403,
        "Access denied: You can only update your own tasks.",
      );
    }

    const task = await TaskModel.findByIdAndUpdate(id, input, {
      returnDocument: "after",
    });
    sendSuccess(res, 200, task, "Task updated successfully.");
  }),

  deleteTask: wrapAsync(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    const { id } = req.params;

    // First check if task exists and verify ownership
    const existingTask = await TaskModel.findById(id);
    if (!existingTask)
      throw new HttpError(404, `Task with ID ${id} not found.`);

    // Check ownership: users can only delete their own tasks, admins can delete all
    if (
      req.user.role !== UserRole.ADMIN &&
      existingTask.userId.toString() !== req.user.id
    ) {
      throw new HttpError(
        403,
        "Access denied: You can only delete your own tasks.",
      );
    }

    const task = await TaskModel.findByIdAndDelete(id);
    sendSuccess(res, 200, task, "Task deleted successfully.");
  }),
};
