import Joi from "joi";
import { sign } from "jsonwebtoken";
import { Document, Model, Schema, model } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

interface IUserMethods {
  generateAuthToken(): string;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
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

userSchema.method("generateAuthToken", function generateAuthToken() {
  const token = sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_KEY as string
  );

  return token;
});

const User = model<IUser, UserModel>("User", userSchema);

function validateUser(user: IUser) {
  const schema = Joi.object<IUser>({
    username: Joi.string().min(6).max(50).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(user);
}

export { User, IUser, UserModel, validateUser };
