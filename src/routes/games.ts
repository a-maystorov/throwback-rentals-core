import { Request, Router } from "express";
import { MongoError } from "mongodb";
import validateObjectId from "../middleware/validateObjectId";
import { Game, IGame, validateGame } from "../models/game";
import { Genre } from "../models/genre";

interface GameRequest extends Request {
  params: { id: string };
  body: IGame;
}

const router = Router();

router.get("/", async (_, res) => {
  const games = await Game.find().sort({ name: 1 });
  res.send(games);
});

router.get("/:id", validateObjectId, async (req: GameRequest, res) => {
  const game = await Game.findById(req.params.id);

  if (!game) {
    return res.status(404).send("The game with the given ID was not found.");
  }

  res.send(game);
});

router.post("/", async (req: GameRequest, res) => {
  const { error } = validateGame(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findById(req.body.genreId);

  if (!genre) {
    return res.status(400).send("Invalid genre.");
  }

  try {
    const game = new Game({
      title: req.body.title,
      genreId: req.body.genreId,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
      purchasePrice: req.body.purchasePrice,
    });

    await game.save();

    res.send(game);
  } catch (err) {
    // TODO: Send the correct response to user.
    if (err instanceof MongoError && err.code === 11000) {
      res.status(400).send("A game with the same title already exists.");
    } else {
      res.status(500).send("Something went wrong. Please try again later.");
    }
  }
});

router.put("/:id", validateObjectId, async (req: GameRequest, res) => {
  const { error } = validateGame(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findById(req.body.genreId);

  if (!genre) {
    return res.status(400).send("Invalid genre.");
  }

  const game = await Game.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genreId: req.body.genreId,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
      purchasePrice: req.body.purchasePrice,
    },
    { new: true }
  );

  if (!game) {
    return res.status(404).send("The game with the given ID was not found.");
  }

  res.send(game);
});

router.delete("/:id", validateObjectId, async (req: GameRequest, res) => {
  const game = await Game.findByIdAndDelete(req.params.id);

  if (!game) {
    return res.status(404).send("The game with the given ID was not found.");
  }

  res.send(game);
});

export default router;
