import { Router } from "express";
import { Genre } from "../models/genre";

const router = Router();

router.get("/", async (_, res) => {
  const genres = await Genre.find().sort({ name: 1 });
  res.send(genres);
});

export default router;
