import Joi from "joi";
import { UserModel } from "../models/User";
import { HttpError, sendSuccess, validate, wrapAsync } from "../utils/helper";

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
  .messages({
    "string.min": "'password' must be at least 8 characters.",
    "string.max": "'password' must be at most 1024 characters.",
    "string.required": "'password' is required.",
  });

const userSchema = Joi.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const userController = {
  registerUser: wrapAsync(async (req, res) => {
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      throw new HttpError(409, "User with this email already exists");
    }
    const input = validate(userSchema, req.body);
    const user = await UserModel.create(input);
    sendSuccess(res, 201, user.email, "User created successfully");
  }),
};
