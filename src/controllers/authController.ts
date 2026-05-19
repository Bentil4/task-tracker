import { UserModel } from "../models/User.model";
import { wrapAsync, sendSuccess } from "../utils/helper";
import {HttpError} from '../utils/errors'
import { sanitizeUserInput } from "../utils/sanitizeInput";

export const authController = {
  registerUser: wrapAsync(async (req, res) => {
    const sanitizedInput = sanitizeUserInput(req.body);
    const existingUser = await UserModel.findOne({
      email: sanitizedInput.email.toLowerCase(),
    });
    if (existingUser) {
      throw new HttpError(409, "User already exists");
    }

    const user = new UserModel(sanitizedInput);
    await user.save();
    sendSuccess(res, 201, true, "User created successfully");
  }),

  loginUser: wrapAsync(async (req, res) => {
    const sanitizedInput = sanitizeUserInput(req.body);
    const { email, password } = sanitizedInput;
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) throw new HttpError(404, "User not found");
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw new HttpError(401, "Invalid password");
    const token = user.generateAuthToken();

    res.header("Authorization", `Bearer ${token}`);
    const Authorization = `Bearer ${token}`;
    sendSuccess(res, 200, Authorization, "User logged in successfully");
  }),
};
