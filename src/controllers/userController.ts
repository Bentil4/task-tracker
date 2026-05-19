import { UserModel } from "../models/User.model";
import { HttpError, sendSuccess, wrapAsync } from "../utils/helper";
import { UserRole } from "../types/user";
import { sanitizeUserInput } from "../utils/sanitizeInput";

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

    
    const existingUser = await UserModel.findById(id);
    if (!existingUser)
      throw new HttpError(404, `User with ID ${id} not found.`);


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
