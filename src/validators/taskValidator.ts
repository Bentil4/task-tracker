import Joi from "joi";
import { ITaskQueryParams } from "../types/task";

const titleSchema = Joi.string().trim().min(1).messages({
  "string.base": "'title' must be a string.",
  "string.empty": "'title' must be a non-empty string.",
  "string.min": "'title' must be a non-empty string.",
});

export const createSchema = Joi.object({
  title: titleSchema
    .required()
    .messages({ "any.required": "'title' is required." }),
  completed: Joi.boolean()
    .required()
    .default(false)
    .messages({ "boolean.base": "'completed' must be a boolean." }),
});

export const updateSchema = Joi.object({
  title: titleSchema,
  completed: Joi.boolean().messages({
    "boolean.base": "'completed' must be a boolean.",
  }),
})
  .min(1)
  .messages({
    "object.min": "Body must include at least 'title' or 'completed'.",
  });

export const querySchema = Joi.object<ITaskQueryParams>({
  completed: Joi.boolean().messages({
    "boolean.base": "'completed' must be true or false.",
  }),
  search: Joi.string().trim().min(1).messages({
    "string.min": "'search' must be a non-empty string.",
  }),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "title")
    .default("createdAt")
    .messages({
      "any.only": "'sortBy' must be one of createdAt, updatedAt, title.",
    }),
  order: Joi.string().valid("asc", "desc").default("desc").messages({
    "any.only": "'order' must be 'asc' or 'desc'.",
  }),
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
