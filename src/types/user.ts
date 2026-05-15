export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  password: string;
  createdAt: Date;
}

export interface ICreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}
