import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = verify(token, process.env.JWT_KEY as string);
    req.body.user = decoded;

    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};

export default auth;
