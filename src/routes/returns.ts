import { Request, Response, Router } from "express";
import Joi from "joi";
import mongoose from "mongoose";
import auth from "../middleware/auth";
import { Game } from "../models/game";
import { IRentalDocument, Rental } from "../models/rental";

const router = Router();

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validateReturn(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rental: IRentalDocument | null = await Rental.lookup(req.body.customerId, req.body.gameId);

    if (!rental) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send("Rental not found.");
    }

    await rental.populate("game");

    rental.return();

    await rental.save({ session });
    await Game.updateOne({ _id: rental.game._id }, { $inc: { numberInStock: 1 } }, { session });
    await session.commitTransaction();

    session.endSession();

    return res.send(rental);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Something failed.");
  }
});

function validateReturn(req: Request) {
  const schema = Joi.object({
    customerId: Joi.string().hex().length(24).required(),
    gameId: Joi.string().hex().length(24).required(),
  });

  return schema.validate(req);
}

export default router;