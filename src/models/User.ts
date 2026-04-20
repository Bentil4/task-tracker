import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../types/user";
import bcrypt from "bcrypt";

export interface IUserDocment extends IUser, Document {}

const userSchema = new Schema<IUserDocment>({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

export const UserModel = mongoose.model<IUserDocment>("User", userSchema);

// try {
//   const salt = bcrypt.genSaltSync(10);
//   this.password = bcrypt.hashSync(this.password, salt);
//   next();
// } catch (error) {
//   next(error as Error);
// }
