import { ITask, IUpdateTaskInput } from "../types/task";
import { ITaskRepository } from "./TaskRepository";

export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: ITask[];
  private nextId: number;

  constructor(initialTasks: ITask[]) {
    this.tasks = [...initialTasks];
    this.nextId =
      initialTasks.length > 0
        ? Math.max(...initialTasks.map((task) => task.id)) + 1
        : 1;
  }

  public getAll(): ITask[] {
    return [...this.tasks];
  }

  public getById(id: number): ITask | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  public create(task: ITask): ITask {
    this.tasks.push(task);
    return task;
  }

  public update(id: number, updates: IUpdateTaskInput): ITask | undefined {
    const existingTask = this.getById(id);

    if (!existingTask) {
      return undefined;
    }

    Object.assign(existingTask, updates);
    return existingTask;
  }

  public remove(id: number): ITask | undefined {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);

    if (taskIndex < 0) {
      return undefined;
    }

    const [deletedTask] = this.tasks.splice(taskIndex, 1);
    return deletedTask;
  }

  public generateId(): number {
    return this.nextId++;
  }
}
