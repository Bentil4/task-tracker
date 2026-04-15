import Joi, { ObjectSchema, ValidationErrorItem } from "joi";
import { HttpError } from "../errors/HttpError";
import { ICreateTaskInput, IUpdateTaskInput } from "../types/task";

const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: true,
};

const titleSchema = Joi.string().trim().min(1).messages({
  "string.base": "'title' must be a string.",
  "string.empty": "'title' must be a non-empty string.",
  "string.min": "'title' must be a non-empty string.",
});

const createTaskSchema: ObjectSchema<ICreateTaskInput> = Joi.object<ICreateTaskInput>({
  title: titleSchema.required().messages({
    "any.required": "'title' is required and must be a non-empty string.",
  }),
  completed: Joi.boolean().default(false).messages({
    "boolean.base": "'completed' must be a boolean.",
  }),
});

const updateTaskSchema: ObjectSchema<IUpdateTaskInput> = Joi.object<IUpdateTaskInput>({
  title: titleSchema,
  completed: Joi.boolean().messages({
    "boolean.base": "'completed' must be a boolean.",
  }),
})
  .min(1)
  .messages({
    "object.base": "Request body must be a valid object.",
    "object.min": "Request body must include at least 'title' or 'completed'.",
  });

const formatValidationMessage = (details: ValidationErrorItem[]): string =>
  details.map((detail) => detail.message).join("; ");

const validateWithSchema = <T>(payload: unknown, schema: ObjectSchema<T>): T => {
  const { error, value } = schema.validate(payload, validationOptions);

  if (error) {
    throw new HttpError(400, formatValidationMessage(error.details));
  }

  return value;
};

export const validateCreateTaskInput = (payload: unknown): ICreateTaskInput =>
  validateWithSchema(payload, createTaskSchema);

export const validateUpdateTaskInput = (payload: unknown): IUpdateTaskInput =>
  validateWithSchema(payload, updateTaskSchema);
