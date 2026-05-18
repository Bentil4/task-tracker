export interface ITask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface ICreateTaskInput {
  title: string;
  completed: boolean;
}

export interface IUpdateTaskInput {
  title?: string;
  completed?: boolean;
}
