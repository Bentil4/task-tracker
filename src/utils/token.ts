import jwt from "jsonwebtoken";
import { IUserDocument } from "../models/User.model";

export function generateAuthToken(user: IUserDocument): string {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "1h" } as jwt.SignOptions,
  );
}
