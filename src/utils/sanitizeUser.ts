import { IUser } from "../types/user";

export const sanitizeUser = (user: IUser): Partial<IUser> => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

export const sanitizeUsers = (users: IUser[]): Partial<IUser>[] => {
  return users.map(user => sanitizeUser(user));
};
