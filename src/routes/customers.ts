import { Request, Router } from "express";
import validateObjectId from "../middleware/validateObjectId";
import { Customer, ICustomer, validateCustomer } from "../models/customer";

interface CustomerRequest extends Request {
  params: {
    id: string;
  };
  body: ICustomer;
}

const router = Router();

router.get("/", async (_, res) => {
  const customers = await Customer.find().sort({ name: 1 });
  res.send(customers);
});

router.get("/:id", validateObjectId, async (req: CustomerRequest, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res
      .status(404)
      .send("The customer with the given ID was not found.");
  }

  res.send(customer);
});

router.post("/", async (req: CustomerRequest, res) => {
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

router.put("/:id", validateObjectId, async (req: CustomerRequest, res) => {
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
    return res
      .status(404)
      .send("The customer with the given ID was not found.");
  }

  res.send(customer);
});

router.delete("/:id", validateObjectId, async (req: CustomerRequest, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    return res
      .status(404)
      .send("The customer with the given ID was not found.");
  }

  res.send(customer);
});

export default router;
