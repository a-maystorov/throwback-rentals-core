import { NextFunction, Request, Response } from "express";
import { IUser } from "../models/user";

interface IAdminRequest extends Request {
  user: IUser;
}

export default function admin(req: IAdminRequest, res: Response, next: NextFunction) {
  if (!req.user.isAdmin) {
    return res.status(403).send("Access denied.");
  }

  next();
}
