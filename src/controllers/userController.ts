import Joi from "joi";
import { UserModel } from "../models/User.model";
import { HttpError, sendSuccess, validate, wrapAsync } from "../utils/helper";
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
  .messages({
    "string.min": "'password' must be at least 8 characters.",
    "string.max": "'password' must be at most 1024 characters.",
    "string.required": "'password' is required.",
  });

const roleSchema = Joi.string()
  .valid(...Object.values(UserRole))
  .default("user");

const userSchema = Joi.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});

export const userController = {
  registerUser: wrapAsync(async (req, res) => {
    const existingUser = await UserModel.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (existingUser) {
      throw new HttpError(409, "User already exists");
    }
    const input = validate(userSchema, req.body);
    const user = await UserModel.create(input);
    res.header("Authorization", `Bearer ${user.generateAuthToken()}`);
    sendSuccess(res, 201, user.email, "User created successfully");
  }),

  loginUser: wrapAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) throw new HttpError(404, "User not found");
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw new HttpError(401, "Invalid password");
    const token = user.generateAuthToken();

    res.header("Authorization", `Bearer ${token}`);
    sendSuccess(res, 200, true, "User logged in successfully");
  }),

  getAllUsers: wrapAsync(async (_req, res) => {
    const users = await UserModel.find();
    sendSuccess(res, 200, users, "Users retrieved successfully");
  }),

  getUserById: wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) throw new HttpError(404, `User with ID ${id} not found.`);
    sendSuccess(res, 200, user, "User retrieved successfully");
  }),

  updateUserEmail: wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      id,
      { email },
      { returnDocument: "after" },
    );
    if (!user) throw new HttpError(404, `User with ID ${id} not found.`);
    sendSuccess(res, 200, user, "User updated successfully");
  }),

  deleteUser: wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) throw new HttpError(404, `User with ID ${id} not found.`);
    sendSuccess(res, 200, user, "User deleted successfully");
  }),
};
