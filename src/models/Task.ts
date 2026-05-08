import mongoose, { Document, Schema } from "mongoose";
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
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const TaskModel = mongoose.model<ITaskDocument>("Task", taskSchema);
