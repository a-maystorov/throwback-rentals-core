import Joi from "joi";
import moment from "moment";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { ICustomer } from "./customer";
import { IGame } from "./game";

interface IRental {
  customer: Types.ObjectId | ICustomer;
  game: Types.ObjectId | IGame;
  dateOut: Date;
  dateReturned?: Date;
  rentalFee?: number;
}

interface IRentalMethods {
  returnRental(): void;
}

interface RentalModel extends Model<IRental, {}, IRentalMethods> {
  lookup(
    customerId: Types.ObjectId,
    gameId: Types.ObjectId
  ): Promise<HydratedDocument<IRental, IRentalMethods>>;
}

const rentalSchema = new Schema<IRental, RentalModel, IRentalMethods>({
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

rentalSchema.static("lookup", function lookup(customerId: Types.ObjectId, gameId: Types.ObjectId) {
  return this.findOne({
    customer: customerId,
    game: gameId,
  });
});

rentalSchema.method("returnRental", function returnRental() {
  this.dateReturned = new Date();
  const rentalDays = moment().diff(this.dateOut, "days");
  this.rentalFee = rentalDays * (this.game as IGame).dailyRentalRate;
});

const Rental = model<IRental, RentalModel>("Rental", rentalSchema);

function validateRental(rental: IRental) {
  const schema = Joi.object({
    customer: Joi.string().hex().length(24).required(),
    game: Joi.string().hex().length(24).required(),
  });

  return schema.validate(rental);
}

export { IRental, Rental, rentalSchema, validateRental };
