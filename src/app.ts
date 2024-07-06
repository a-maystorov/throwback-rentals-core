import express from "express";
import genres from "./routes/genres";
import customers from "./routes/customers";
import games from "./routes/games";

const app = express();

app.use(express.json());

app.use("/api/genres", genres);
app.use("/api/customers", customers);
app.use("/api/games", games);

export default app;
