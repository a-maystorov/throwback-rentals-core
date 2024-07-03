import { Request, Router } from "express";
import validateObjectId from "../middleware/validateObjectId";
import { Genre, validateGenre } from "../models/genre";

interface GenreRequest extends Request {
  params: {
    id: string;
  };

  body: {
    name: string;
  };
}

const router = Router();

router.get("/", async (_, res) => {
  const genres = await Genre.find().sort({ name: 1 });
  res.send(genres);
});

router.get("/:id", validateObjectId, async (req: GenreRequest, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) {
    return res.status(404).send("The genre with the given ID was not found.");
  }

  res.send(genre);
});

router.post("/", async (req: GenreRequest, res) => {
  const { error } = validateGenre(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = new Genre({ name: req.body.name });
  await genre.save();

  res.send(genre);
});

router.put("/:id", validateObjectId, async (req: GenreRequest, res) => {
  const { error } = validateGenre(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!genre) {
    return res.status(404).send("The genre with the given ID was not found.");
  }

  res.send(genre);
});

router.delete("/:id", validateObjectId, async (req: GenreRequest, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);

  if (!genre) {
    return res.status(404).send("The genre with the given ID was not found.");
  }

  res.send(genre);
});

export default router;
