import { Router } from "express";
import { Customer } from "../models/customer";

const router = Router();

router.get("/", async (_, res) => {
  const customers = await Customer.find().sort({ name: 1 });
  res.send(customers);
});

export default router;
