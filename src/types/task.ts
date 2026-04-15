export interface ITask {
  id: number;
  title: string;
  completed: boolean;
}

export interface ICreateTaskInput {
  title: string;
  completed?: boolean;
}

export interface IUpdateTaskInput {
  title?: string;
  completed?: boolean;
}
