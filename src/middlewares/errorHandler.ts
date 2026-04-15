import { NextFunction, Request, Response } from "express";
import { IApiErrorResponse } from "../types/api";
import { HttpError } from "../errors/HttpError";

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response<IApiErrorResponse>,
  _next: NextFunction,
): void => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  response.status(statusCode).json({
    success: false,
    error: {
      message: error.message || "An unexpected error occurred.",
      ...(isDevelopment ? { stack: error.stack } : {}),
    },
  });
};
