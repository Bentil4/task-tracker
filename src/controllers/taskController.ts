import { NextFunction, Request, RequestHandler, Response } from "express";
import { TaskService } from "../services/TaskService";
import { sendSuccess } from "../utils/apiResponse";
import { getSingleRouteParam, parsePositiveId } from "../utils/requestParsers";
import {
  validateCreateTaskInput,
  validateUpdateTaskInput,
} from "../validators/taskValidators";

export interface TaskController {
  getAllTasks: RequestHandler;
  getTaskById: RequestHandler;
  createTask: RequestHandler;
  updateTask: RequestHandler;
  deleteTask: RequestHandler;
}

const runControllerAction =
  (
    action: (req: Request, res: Response, next: NextFunction) => void,
  ): RequestHandler =>
  (req, res, next) => {
    try {
      action(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export const createTaskController = (
  taskService: TaskService,
): TaskController => ({
  getAllTasks: runControllerAction((_req, res) => {
    const tasks = taskService.getAllTasks();
    sendSuccess(res, 200, tasks, "Tasks retrieved successfully.");
  }),

  getTaskById: runControllerAction((req, res) => {
    const id = parsePositiveId(getSingleRouteParam(req.params.id));
    const task = taskService.getTaskById(id);
    sendSuccess(res, 200, task, "Task retrieved successfully.");
  }),

  createTask: runControllerAction((req, res) => {
    const payload = validateCreateTaskInput(req.body);
    const task = taskService.createTask(payload);
    sendSuccess(res, 201, task, "Task created successfully.");
  }),

  updateTask: runControllerAction((req, res) => {
    const id = parsePositiveId(getSingleRouteParam(req.params.id));
    const payload = validateUpdateTaskInput(req.body);
    const task = taskService.updateTask(id, payload);
    sendSuccess(res, 200, task, "Task updated successfully.");
  }),

  deleteTask: runControllerAction((req, res) => {
    const id = parsePositiveId(getSingleRouteParam(req.params.id));
    const task = taskService.deleteTask(id);
    sendSuccess(res, 200, task, "Task deleted successfully.");
  }),
});
