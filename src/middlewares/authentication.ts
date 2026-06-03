import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { IUser, UserRole } from "../types/user";

interface AuthPayload extends Pick<IUser, "email" | "role"> {
  id?: string;
  _id?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ status: "error", message: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: "error", message: "Invalid or expired token" });
    }

    const payload = decoded as AuthPayload;
    const userId = payload.id ?? payload._id;

    if (!userId) {
      return res.status(403).json({ status: "error", message: "Invalid token payload" });
    }

    req.user = {
      ...payload,
      id: userId,
    } as IUser;
    next();
  });
}

export function requireRole(roles: UserRole | UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Authentication required" });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: "error", message: "Insufficient permissions" });
    }

    next();
  };
}
