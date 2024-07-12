import { NextFunction, Request, Response } from "express";
import { IUser } from "../models/user";

interface AuthenticatedAdminRequest extends Request {
  user: IUser;
}

export default function admin(req: Request, res: Response, next: NextFunction) {
  if (!(req as AuthenticatedAdminRequest).user.isAdmin) {
    return res.status(403).send("Access denied.");
  }

  next();
}
