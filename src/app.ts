import express from "express";
import genres from "./routes/genres";
import customers from "./routes/customers";
import games from "./routes/games";
import rentals from "./routes/rentals";
import users from "./routes/users";
import auth from "./routes/auth";
import returns from "./routes/returns";

const app = express();

app.use(express.json());

app.use("/api/genres", genres);
app.use("/api/customers", customers);
app.use("/api/games", games);
app.use("/api/rentals", rentals);
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/returns", returns);

export default app;
