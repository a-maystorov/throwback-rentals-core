import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import _ from "lodash";
import auth from "../middleware/auth";
import { User, validateUser } from "../models/user";

interface IUsersRequest extends Request {
  user?: InstanceType<typeof User>;
}

const router = Router();

router.get("/me", auth, async (req: IUsersRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).send("Access denied. No user information found.");
  }

  const user = await User.findById(req.user._id).select("-password");

  res.send(user);
});

router.post("/", async (req: Request, res: Response) => {
  const { error } = validateUser(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("User already registered.");
  }

  user = new User(_.pick(req.body, ["username", "email", "password"]));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "username", "email"]));
});

export default router;
