import { HttpError } from "../errors/HttpError";
import { ITaskRepository } from "../repositories/TaskRepository";
import { ICreateTaskInput, ITask, IUpdateTaskInput } from "../types/task";

export interface TaskService {
  getAllTasks(): ITask[];
  getTaskById(id: number): ITask;
  createTask(input: ICreateTaskInput): ITask;
  updateTask(id: number, updates: IUpdateTaskInput): ITask;
  deleteTask(id: number): ITask;
}

export class DefaultTaskService implements TaskService {
  constructor(private readonly taskRepository: ITaskRepository) {}

  public getAllTasks(): ITask[] {
    return this.taskRepository.getAll();
  }

  public getTaskById(id: number): ITask {
    const task = this.taskRepository.getById(id);

    if (!task) {
      throw new HttpError(404, `Task with ID ${id} not found.`);
    }

    return task;
  }

  public createTask(input: ICreateTaskInput): ITask {
    const newTask: ITask = {
      id: this.taskRepository.generateId(),
      title: input.title,
      completed: input.completed ?? false,
    };

    return this.taskRepository.create(newTask);
  }

  public updateTask(id: number, updates: IUpdateTaskInput): ITask {
    const updatedTask = this.taskRepository.update(id, updates);

    if (!updatedTask) {
      throw new HttpError(404, `Task with ID ${id} not found.`);
    }

    return updatedTask;
  }

  public deleteTask(id: number): ITask {
    const deletedTask = this.taskRepository.remove(id);

    if (!deletedTask) {
      throw new HttpError(404, `Task with ID ${id} not found.`);
    }

    return deletedTask;
  }
}
