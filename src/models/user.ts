import Joi from "joi";
import { sign } from "jsonwebtoken";
import { Schema, model } from "mongoose";

interface IUser {
  username: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  generateAuthToken(): string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },

  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_KEY as string
  );

  return token;
};

const User = model("User", userSchema);

function validateUser(user: IUser) {
  const schema = Joi.object<IUser>({
    username: Joi.string().min(6).max(50).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(user);
}

export { IUser, User, userSchema, validateUser };
