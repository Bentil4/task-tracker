import Joi from "joi";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { TaskModel } from "../models/Task";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

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

const validate = <T>(schema: Joi.ObjectSchema<T>, payload: unknown): T => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });
  if (error)
    throw new HttpError(400, error.details.map((d) => d.message).join("; "));
  return value;
};

const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message: string,
): void => {
  res.status(statusCode).json({ success: true, message, data });
};

const wrapAsync = (
  fn: (req: Request, res: Response) => Promise<void>,
): RequestHandler => {
  return async (req, res, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };
};

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
