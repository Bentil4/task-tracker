import { Types } from "mongoose";

export interface ITask {
  id: string;
  title: string;
  completed: boolean;
  userId: Types.ObjectId;
  createdAt: Date;
}

export interface ICreateTaskInput {
  title: string;
  completed?: boolean;
}

export interface IUpdateTaskInput {
  title?: string;
  completed?: boolean;
}
