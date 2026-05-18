import Joi from "joi";

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
