import { Request, Response, Router } from "express";
import admin from "../middleware/admin";
import auth from "../middleware/auth";
import validateObjectId from "../middleware/validateObjectId";
import { Customer, validateCustomer } from "../models/customer";

const router = Router();

router.get("/", auth, async (_, res) => {
  const customers = await Customer.find().sort({ name: 1 });
  res.send(customers);
});

router.get("/:id", [auth, validateObjectId], async (req: Request, res: Response) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).send("The customer with the given ID was not found.");
  }

  res.send(customer);
});

router.post("/", auth, async (req: Request, res) => {
  const { error } = validateCustomer(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  });

  await customer.save();

  res.send(customer);
});

router.put("/:id", [auth, validateObjectId], async (req: Request, res: Response) => {
  const { error } = validateCustomer(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold,
    },
    { new: true }
  );

  if (!customer) {
    return res.status(404).send("The customer with the given ID was not found.");
  }

  res.send(customer);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req: Request, res: Response) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    return res.status(404).send("The customer with the given ID was not found.");
  }

  res.send(customer);
});

export default router;
