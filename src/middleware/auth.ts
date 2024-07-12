import { NextFunction, Request, Response } from "express";
import { JwtPayload, Secret, verify } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KET: Secret = process.env.JWT_KEY as string;

export interface AuthenticatedRequest extends Request {
  user: string | JwtPayload;
}

const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = verify(token, SECRET_KET);
    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};

export default auth;
