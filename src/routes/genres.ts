import { Router } from "express";
import validateObjectId from "../middleware/validateObjectId";
import { Genre } from "../models/genre";

const router = Router();

router.get("/", async (_, res) => {
  const genres = await Genre.find().sort({ name: 1 });
  res.send(genres);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) {
    return res.status(404).send("The genre with the given ID was not found.");
  }

  res.send(genre);
});

export default router;
