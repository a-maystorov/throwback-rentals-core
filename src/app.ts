import express from "express";
import genres from "./routes/genres";
import customers from "./routes/customers";

const app = express();

app.use(express.json());

app.use("/api/genres", genres);
app.use("/api/customers", customers);

export default app;
