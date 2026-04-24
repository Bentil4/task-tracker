import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "./../utils/helper";
import { IUser } from "../types/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// export const authenticate = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     throw new HttpError(401, "Unauthorized");
//   }
//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     throw new HttpError(401, "Invalid token");
//   }
// };

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = decoded as IUser;
    next();
  });
}
