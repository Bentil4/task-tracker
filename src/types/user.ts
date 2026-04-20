export interface IUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
}


export interface ICreateUserInput{
    fullName: string;
    email: string;
    password: string;
}
