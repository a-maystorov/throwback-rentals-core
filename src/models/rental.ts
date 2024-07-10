import Joi from "joi";
import moment from "moment";
import { model, Schema, Types, Document, Model } from "mongoose";

interface IRental {
  customer: Types.ObjectId;
  game: Types.ObjectId;
  dateOut: Date;
  dateReturned?: Date;
  rentalFee?: number;
}

interface IRentalDocument extends IRental, Document {
  return(): void;
}

interface IRentalModel extends Model<IRentalDocument> {
  lookup(customerId: Types.ObjectId, gameId: Types.ObjectId): Promise<IRentalDocument | null>;
}

const rentalSchema = new Schema<IRentalDocument, IRentalModel>({
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

rentalSchema.statics.lookup = function (customerId: Types.ObjectId, gameId: Types.ObjectId) {
  return this.findOne({
    customer: customerId,
    game: gameId,
  });
};

rentalSchema.methods.return = function () {
  this.dateReturned = new Date();

  const rentalDays = moment().diff(this.dateOut, "days");

  this.rentalFee = rentalDays * this.game.dailyRentalRate;
};

const Rental = model<IRentalDocument, IRentalModel>("Rental", rentalSchema);

function validateRental(rental: IRental) {
  const schema = Joi.object({
    customer: Joi.string().hex().length(24).required(),
    game: Joi.string().hex().length(24).required(),
  });

  return schema.validate(rental);
}

export { IRental, IRentalDocument, Rental, rentalSchema, validateRental };
