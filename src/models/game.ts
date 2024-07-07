import Joi from "joi";
import { model, Schema, Types } from "mongoose";

interface IGame {
  title: string;
  genre: Types.ObjectId;
  numberInStock: number;
  dailyRentalRate: number;
  purchasePrice: number;
}

const gameSchema = new Schema<IGame>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 255,
  },

  genre: {
    type: Schema.Types.ObjectId,
    ref: "Genre",
    required: true,
  },

  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },

  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },

  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
});

const Game = model("Game", gameSchema);

function validateGame(game: IGame) {
  const schema = Joi.object<IGame>({
    title: Joi.string().min(3).max(255).required(),
    genre: Joi.string().required(),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required(),
    purchasePrice: Joi.number().min(0).max(255).required(),
  });

  return schema.validate(game);
}

export { Game, gameSchema, IGame, validateGame };
