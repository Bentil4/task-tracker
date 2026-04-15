import { ITask, IUpdateTaskInput } from "../types/task";

export interface ITaskRepository {
  getAll(): ITask[];
  getById(id: number): ITask | undefined;
  create(task: ITask): ITask;
  update(id: number, updates: IUpdateTaskInput): ITask | undefined;
  remove(id: number): ITask | undefined;
  generateId(): number;
}
