import Joi from "joi";
import { IUserQueryParams, UserRole } from "../types/user";

const fullNameSchema = Joi.string().trim().min(5).max(100).required().messages({
  "string.min": "'fullName' must be at least 5 characters.",
  "string.max": "'fullName' must be at most 100 characters.",
  "string.required": "'fullName' is required.",
});

const emailSchema = Joi.string()
  .trim()
  .min(5)
  .max(50)
  .required()
  .email()
  .messages({
    "string.email": "'email' must be a valid email address.",
    "string.required": "'email' is required.",
  });

const passwordSchema = Joi.string()
  .trim()
  .min(8)
  .max(1024)
  .required()
  .pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  )
  .messages({
    "string.min": "'password' must be at least 8 characters.",
    "string.max": "'password' must be at most 1024 characters.",
    "string.required": "'password' is required.",
    "string.pattern.base":
      "'password' must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  });

const roleSchema = Joi.string()
  .valid(...Object.values(UserRole))
  .default("user");

export const userSchema = Joi.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});

export const updateEmailSchema = Joi.object({
  email: emailSchema,
});

export const querySchema = Joi.object<IUserQueryParams>({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "'page' must be a number.",
    "number.min": "'page' must be at least 1.",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "'limit' must be a number.",
    "number.min": "'limit' must be at least 1.",
    "number.max": "'limit' cannot exceed 100.",
  }),
});
