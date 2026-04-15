import { Response } from "express";
import { IApiSuccessResponse } from "../types/api";

export const sendSuccess = <T>(
  response: Response,
  statusCode: number,
  data: T,
  message = "Success",
): Response<IApiSuccessResponse<T>> =>
  response.status(statusCode).json({
    success: true,
    message,
    data,
  });
