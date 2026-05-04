import { UserModel } from "../models/User.model";
import { wrapAsync, HttpError, validate, sendSuccess } from "../utils/helper";
import { sanitizeUserInput } from "../utils/sanitizeInput";
import { userSchema } from "./userController";

export const authController = {
  registerUser: wrapAsync(async (req, res) => {
    const sanitizedInput = sanitizeUserInput(req.body);
    const existingUser = await UserModel.findOne({
      email: sanitizedInput.email.toLowerCase(),
    });
    if (existingUser) {
      throw new HttpError(409, "User already exists");
    }
    const input = validate(userSchema, sanitizedInput);
    const user = await UserModel.create(input);
    res.header("Authorization", `Bearer ${user.generateAuthToken()}`);
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
    sendSuccess(res, 200, true, "User logged in successfully");
  }),
};
