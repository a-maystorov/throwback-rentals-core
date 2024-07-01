import Joi from "joi";
import { Schema, model } from "mongoose";

interface IGenre {
  name: string;
}

const genreSchema = new Schema<IGenre>({
  name: {
    type: String,
    required: true,
    min: 3,
    maxlength: 50,
  },
});

const Genre = model("Genre", genreSchema);

function validateGenre(genre: IGenre) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });

  return schema.validate(genre);
}

export { Genre, IGenre, genreSchema, validateGenre };
