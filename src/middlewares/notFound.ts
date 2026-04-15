import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError";

export const notFound = (request: Request, _response: Response, next: NextFunction): void => {
  next(new HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
};
