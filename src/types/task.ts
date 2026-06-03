import { Types } from "mongoose";

export interface ITask {
  id: string;
  title: string;
  completed: boolean;
  userId: Types.ObjectId;
}

export interface ICreateTaskInput {
  title: string;
  completed: boolean;
}

export interface IUpdateTaskInput {
  title?: string;
  completed?: boolean;
}

export interface ITaskQueryParams {
  completed?: boolean;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
