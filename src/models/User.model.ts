import mongoose, { Document, Schema } from "mongoose";
import { IUser, UserRole } from "../types/user";
import bcrypt from "bcrypt";

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [5, "Full name must be a non-empty string"],
      maxlength: [100, "Full name must be at most 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      minlength: [5, "Email must be a non-empty string"],
      maxlength: [50, "Email must be at most 50 characters"],
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [1024, "Password must be at most 1024 characters"],
      select: false,
      validate: {
        validator: function (value: string) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value,
          );
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (this: IUserDocument) {
  if (!this.isModified("password")) return;

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};


export const UserModel = mongoose.model<IUserDocument>("User", userSchema);
