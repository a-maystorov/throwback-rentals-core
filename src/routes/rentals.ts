import { Request, Response, Router } from "express";
import { startSession } from "mongoose";
import admin from "../middleware/admin";
import auth from "../middleware/auth";
import validateObjectId from "../middleware/validateObjectId";
import { Customer } from "../models/customer";
import { Game } from "../models/game";
import { Rental, validateRental } from "../models/rental";

const router = Router();

router.get("/", auth, async (_, res) => {
  const rentals = await Rental.find()
    .populate("customer")
    .populate({
      path: "game",
      populate: {
        path: "genre",
        model: "Genre",
      },
    })
    .sort({ dateOut: -1 });

  res.send(rentals);
});

router.post("/", auth, async (req: Request, res: Response) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const { error } = validateRental(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const customer = await Customer.findById(req.body.customer).session(session);
    if (!customer) {
      return res.status(400).send("Invalid customer.");
    }

    const game = await Game.findById(req.body.game).session(session).populate("genre");
    if (!game) {
      return res.status(400).send("Invalid game.");
    }

    if (game.numberInStock === 0) {
      return res.status(400).send("Game not in stock.");
    }

    const rental = new Rental({ customer, game });
    await Game.updateOne({ _id: game._id }, { $inc: { numberInStock: -1 } }, { session });
    await rental.save({ session });
    await session.commitTransaction();

    const populatedRental = await Rental.findById(rental._id)
      .populate("customer")
      .populate({
        path: "game",
        populate: {
          path: "genre",
          model: "Genre",
        },
      });

    return res.send(populatedRental);
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).send("Transaction aborted. Error: " + error);
  } finally {
    session.endSession();
  }
});

router.get("/:id", [auth, validateObjectId], async (req: Request, res: Response) => {
  const rental = await Rental.findById(req.params.id)
    .populate("customer")
    .populate({
      path: "game",
      populate: {
        path: "genre",
        model: "Genre",
      },
    });

  if (!rental) {
    return res.status(404).send("The rental with the given ID was not found.");
  }

  res.send(rental);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req: Request, res: Response) => {
  const rental = await Rental.findByIdAndDelete(req.params.id)
    .populate("customer")
    .populate({
      path: "game",
      populate: {
        path: "genre",
        model: "Genre",
      },
    });

  if (!rental) {
    return res.status(404).send("The rental with the given ID was not found.");
  }

  res.send(rental);
});

export default router;
