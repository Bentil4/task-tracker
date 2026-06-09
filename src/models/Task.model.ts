import mongoose, { Document, Schema, Types } from "mongoose";
import { ITask } from "../types/task";

export interface ITaskDocument extends ITask, Document {}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title must be a non-empty string"],
    },
    completed: {
      type: Boolean,
      required: [true, "Completion status is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  },
);

export const TaskModel = mongoose.model<ITaskDocument>("Task", taskSchema);
