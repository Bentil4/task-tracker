import Joi from "joi";
import { UserModel } from "../models/User.model";
import { HttpError, sendSuccess, validate, wrapAsync } from "../utils/helper";
import { UserRole } from "../types/user";
import { sanitizeUser } from "../utils/sanitizeUser";
import { sanitizeUserInput } from "../utils/sanitizeInput";

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

export const userController = {
  getAllUsers: wrapAsync(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }
    const users = await UserModel.find();
    sendSuccess(res, 200, users, "Users retrieved successfully");
  }),

  getUserById: wrapAsync(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) throw new HttpError(404, `User with ID ${id} not found.`);

    if (
      req.user.role !== UserRole.ADMIN &&
      user._id.toString() !== req.user.id
    ) {
      throw new HttpError(
        403,
        "Access denied: You can only access your own profile.",
      );
    }

    sendSuccess(res, 200, user, "User retrieved successfully");
  }),

  updateUserEmail: wrapAsync(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    const { id } = req.params;
    const sanitizedInput = sanitizeUserInput(req.body);
    const { email } = sanitizedInput;

    // First check if user exists and verify ownership
    const existingUser = await UserModel.findById(id);
    if (!existingUser)
      throw new HttpError(404, `User with ID ${id} not found.`);

    // Check ownership: users can only update their own profile, admins can update all
    if (
      req.user.role !== UserRole.ADMIN &&
      existingUser._id.toString() !== req.user.id
    ) {
      throw new HttpError(
        403,
        "Access denied: You can only update your own profile.",
      );
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { email },
      { returnDocument: "after" },
    );
    sendSuccess(res, 200, user, "User updated successfully");
  }),

  deleteUser: wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) throw new HttpError(404, `User with ID ${id} not found.`);
    sendSuccess(res, 200, user, "User deleted successfully");
  }),
};
