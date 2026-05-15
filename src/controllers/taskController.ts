import Joi from "joi";
import { TaskModel } from "../models/Task.model";
import { HttpError, validate, sendSuccess, wrapAsync } from "../utils/helper";
import { UserRole } from "../types/user";
import { Types } from "mongoose";

const titleSchema = Joi.string().trim().min(1).messages({
  "string.base": "'title' must be a string.",
  "string.empty": "'title' must be a non-empty string.",
  "string.min": "'title' must be a non-empty string.",
});

const createSchema = Joi.object({
  title: titleSchema
    .required()
    .messages({ "any.required": "'title' is required." }),
  completed: Joi.boolean()
    .default(false)
    .messages({ "boolean.base": "'completed' must be a boolean." }),
});

const updateSchema = Joi.object({
  title: titleSchema,
  completed: Joi.boolean().messages({
    "boolean.base": "'completed' must be a boolean.",
  }),
})
  .min(1)
  .messages({
    "object.min": "Body must include at least 'title' or 'completed'.",
  });

export const taskController = {
  getAllTasks: wrapAsync(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    let tasks;
    if (req.user.role === UserRole.ADMIN) {
      tasks = await TaskModel.find().sort({ createdAt: -1 });
    } else {
      tasks = await TaskModel.find({ userId: req.user.id }).sort({
        createdAt: -1,
      });
    }
    sendSuccess(res, 200, tasks, "Tasks retrieved successfully.");
  }),

  getTaskById: wrapAsync(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    const { id } = req.params;
    const task = await TaskModel.findById(id);
    if (!task) throw new HttpError(404, `Task with ID ${id} not found.`);

    // Check ownership: users can only access their own tasks, admins can access all
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

    // First check if task exists and verify ownership
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
