import { NextFunction, Request, Response } from "express";

export const logger = (request: Request, _response: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${request.method} ${request.originalUrl}`);
  next();
};
