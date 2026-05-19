import Joi from "joi";
import { UserRole } from "../types/user";

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
