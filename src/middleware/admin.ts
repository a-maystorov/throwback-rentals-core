import { NextFunction, Request, Response } from "express";

export default function admin(req: Request, res: Response, next: NextFunction) {
  if (!req.body.user.isAdmin) {
    return res.status(403).send("Access denied.");
  }

  next();
}
