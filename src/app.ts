import express from "express";
import genres from "./routes/genres";
import userRoutes from "./routes/user";

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/genres", genres);

export default app;
