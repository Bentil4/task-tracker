import Joi from "joi";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError } from "./errors";

export const validate = <T>(schema: Joi.ObjectSchema<T>, payload: unknown): T => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });
  if (error)
    throw new HttpError(400, error.details.map((d) => d.message).join("; "));
  return value;
};

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message: string,
): void => {
  res.status(statusCode).json({ success: true, message, data });
};

export const wrapAsync = (
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
