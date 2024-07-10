import { Request, Response, Router } from "express";
import { MongoError } from "mongodb";
import admin from "../middleware/admin";
import auth from "../middleware/auth";
import validateObjectId from "../middleware/validateObjectId";
import { Game, validateGame } from "../models/game";
import { Genre } from "../models/genre";

const router = Router();

router.get("/", async (_, res) => {
  const games = await Game.find().populate("genre").sort({ name: 1 });
  res.send(games);
});

router.get("/:id", [auth, validateObjectId], async (req: Request, res: Response) => {
  const game = await Game.findById(req.params.id).populate("genre");

  if (!game) {
    return res.status(404).send("The game with the given ID was not found.");
  }

  res.send(game);
});

router.post("/", auth, async (req: Request, res) => {
  const { error } = validateGame(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findById(req.body.genre);

  if (!genre) {
    return res.status(400).send("Invalid genre.");
  }

  try {
    const game = new Game({
      title: req.body.title,
      genre: req.body.genre,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
      purchasePrice: req.body.purchasePrice,
    });

    await game.save();

    const populatedGame = await Game.findById(game._id).populate("genre");

    res.send(populatedGame);
  } catch (err) {
    if (err instanceof MongoError && err.code === 11000) {
      res.status(400).send("A game with the same title already exists.");
    } else {
      res.status(500).send("Something went wrong. Please try again later.");
    }
  }
});

router.put("/:id", [auth, validateObjectId], async (req: Request, res: Response) => {
  const { error } = validateGame(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findById(req.body.genre);

  if (!genre) {
    return res.status(400).send("Invalid genre.");
  }

  const game = await Game.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: req.body.genre,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
      purchasePrice: req.body.purchasePrice,
    },
    { new: true }
  ).populate("genre");

  if (!game) {
    return res.status(404).send("The game with the given ID was not found.");
  }

  res.send(game);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req: Request, res: Response) => {
  const game = await Game.findByIdAndDelete(req.params.id).populate("genre");

  if (!game) {
    return res.status(404).send("The game with the given ID was not found.");
  }

  res.send(game);
});

export default router;
