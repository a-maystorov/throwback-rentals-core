import { Router, Request } from "express";
import { Customer } from "../models/customer";
import validateObjectId from "../middleware/validateObjectId";

interface CustomerRequest extends Request {
  params: {
    id: string;
  };

  body: {
    name: string;
    phone: string;
    isGold?: boolean;
  };
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

export default router;