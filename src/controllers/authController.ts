import { UserModel } from "../models/User.model";
import { wrapAsync, sendSuccess, validate } from "../utils/helper";
import { HttpError } from "../utils/errors";
import { sanitizeUserInput } from "../utils/sanitizeInput";
import { generateAuthToken } from "../utils/token";
import { userSchema } from "../validators/userValidator";

export const authController = {
  registerUser: wrapAsync(async (req, res) => {
    const validated = validate(userSchema, req.body);
    const sanitizedInput = sanitizeUserInput(validated);
    const existingUser = await UserModel.findOne({
      email: validated.email.toLowerCase(),
    });

    if (existingUser) {
      throw new HttpError(
        400,
        "Registration failed. Please check your details.",
      );
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
    if (!user) throw new HttpError(401, "Invalid credentials");
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw new HttpError(401, "Invalid credentials");
    const token = generateAuthToken(user);

    res.header("Authorization", `Bearer ${token}`);
    sendSuccess(res, 200, { token }, "User logged in successfully");
  }),
};
