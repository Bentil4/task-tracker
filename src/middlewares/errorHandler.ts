import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/errors";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || "An unexpected error occurred.",
      ...(isDevelopment ? { stack: error.stack } : {}),
    },
  });
};
