import Joi from "joi";
import { Schema, model } from "mongoose";

interface ICustomer {
  name: string;
  isGold?: boolean;
  phone: string;
}

const customerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 20,
  },

  isGold: {
    type: Boolean,
    default: false,
  },

  phone: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 20,
  },
});

const Customer = model("Customer", customerSchema);

function validateCustomer(customer: ICustomer) {
  const schema = Joi.object({
    name: Joi.string().min(6).max(20).required(),
    phone: Joi.string().min(6).max(20).required(),
    isGold: Joi.boolean().default(false),
  });

  return schema.validate(customer);
}

export { Customer, ICustomer, customerSchema, validateCustomer };
