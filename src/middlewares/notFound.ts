import { NextFunction, Request, Response } from "express";
import { HttpError } from "../controllers/taskController";

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
