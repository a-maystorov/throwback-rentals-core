import bcrypt from "bcrypt";
import express, { Request, Response } from "express";
import Joi from "joi";
import { IUser, User } from "../models/user";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { error } = validateAuth(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let user: IUser | null;

  try {
    user = await User.findOne({ email: req.body.email });
  } catch (err) {
    return res.status(400).send("Invalid email or password.");
  }

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(400).send("Invalid email or password.");
  }

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).header("access-control-expose-headers", "x-auth-token").send(token);
});

function validateAuth(req: Request) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
}

export default router;
