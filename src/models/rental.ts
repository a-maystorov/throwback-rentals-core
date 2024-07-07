import Joi from "joi";
import { model, Schema, Types } from "mongoose";

interface IRental {
  customer: Types.ObjectId;
  game: Types.ObjectId;
  dateOut: Date;
  dateReturned?: Date;
  rentalFee?: number;
}

const rentalSchema = new Schema<IRental>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },

  game: {
    type: Schema.Types.ObjectId,
    ref: "Game",
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
    customer: Joi.string().required(),
    game: Joi.string().required(),
  });

  return schema.validate(rental);
}

export { IRental, Rental, rentalSchema, validateRental };
