import Joi from "joi";
import { Schema, model } from "mongoose";
import { customerSchema } from "./customer";

interface IRental {
  customer: typeof customerSchema;
  game: {
    title: string;
    dailyRentalRate: number;
  };
  dateOut: Date;
  dateReturned?: Date;
  rentalFee?: number;
}

const rentalSchema = new Schema<IRental>({
  customer: {
    type: customerSchema,
    required: true,
  },
  game: {
    type: new Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 255,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
    }),
    required: true,
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dateReturned: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 0,
  },
});

const Rental = model("Rental", rentalSchema);

function validateRental(rental: IRental) {
  const schema = Joi.object({
    customerId: Joi.string().required(),
    gameId: Joi.string().required(),
  });

  return schema.validate(rental);
}

export { IRental, Rental, rentalSchema, validateRental };
