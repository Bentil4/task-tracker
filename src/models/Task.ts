import { ITask, ICreateTaskInput, IUpdateTaskInput } from "../types/task";
import { tasks } from "../data/seedTask";

let nextId = tasks.length + 1;

export const TaskModel = {
  getAll: (): ITask[] => [...tasks],

  getById: (id: number): ITask | undefined => tasks.find((t) => t.id === id),

  create: (input: ICreateTaskInput): ITask => {
    const task: ITask = {
      id: nextId++,
      title: input.title,
      completed: input.completed ?? false,
    };
    tasks.push(task);
    return task;
  },

  update: (id: number, updates: IUpdateTaskInput): ITask | undefined => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return undefined;
    Object.assign(task, updates);
    return task;
  },

  remove: (id: number): ITask | undefined => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index < 0) return undefined;
    return tasks.splice(index, 1)[0];
  },
};
