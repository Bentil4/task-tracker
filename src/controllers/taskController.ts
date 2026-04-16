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

const parseId = (raw: string | string[]): number => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!/^[1-9]\d*$/.test(value))
    throw new HttpError(400, "Invalid task ID. It must be a positive integer.");
  return Number(value);
};

const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message: string,
): void => {
  res.status(statusCode).json({ success: true, message, data });
};

const wrap =
  (fn: (req: Request, res: Response) => void): RequestHandler =>
  (req, res, next: NextFunction) => {
    try {
      fn(req, res);
    } catch (err) {
      next(err);
    }
  };

export const taskController = {
  getAllTasks: wrap((_req, res) => {
    sendSuccess(res, 200, TaskModel.getAll(), "Tasks retrieved successfully.");
  }),

  getTaskById: wrap((req, res) => {
    const id = parseId(req.params.id);
    const task = TaskModel.getById(id);
    if (!task) throw new HttpError(404, `Task with ID ${id} not found.`);
    sendSuccess(res, 200, task, "Task retrieved successfully.");
  }),

  createTask: wrap((req, res) => {
    const input = validate(createSchema, req.body);
    sendSuccess(
      res,
      201,
      TaskModel.create(input),
      "Task created successfully.",
    );
  }),

  updateTask: wrap((req, res) => {
    const id = parseId(req.params.id);
    const input = validate(updateSchema, req.body);
    const task = TaskModel.update(id, input);
    if (!task) throw new HttpError(404, `Task with ID ${id} not found.`);
    sendSuccess(res, 200, task, "Task updated successfully.");
  }),

  deleteTask: wrap((req, res) => {
    const id = parseId(req.params.id);
    const task = TaskModel.remove(id);
    if (!task) throw new HttpError(404, `Task with ID ${id} not found.`);
    sendSuccess(res, 200, task, "Task deleted successfully.");
  }),
};
