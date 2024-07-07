import express, { Request } from "express";
import validateObjectId from "../middleware/validateObjectId";
import { Customer } from "../models/customer";
import { Game } from "../models/game";
import { IRental, Rental, validateRental } from "../models/rental";

interface RentalRequest extends Request {
  params: { id: string };
  body: IRental;
}

const router = express.Router();

router.get("/", async (_, res) => {
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

router.post("/", async (req: RentalRequest, res) => {
  const { error } = validateRental(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const customer = await Customer.findById(req.body.customer);

  if (!customer) {
    return res.status(400).send("Invalid customer.");
  }

  const game = await Game.findById(req.body.game).populate("genre");

  if (!game) {
    return res.status(400).send("Invalid game.");
  }

  if (game.numberInStock === 0) {
    return res.status(400).send("Game not in stock.");
  }

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },

    game: {
      _id: game._id,
      title: game.title,
      dailyRentalRate: game.dailyRentalRate,
      genre: game.genre,
    },
  });

  await Game.updateOne(
    { _id: rental.game._id },
    { $inc: { numberInStock: -1 } }
  );

  await rental.save();

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
});

router.get("/:id", validateObjectId, async (req: RentalRequest, res) => {
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

router.delete("/:id", validateObjectId, async (req: RentalRequest, res) => {
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