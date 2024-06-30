import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hi Mom");
});

app.listen(8080, () => console.log("Server started"));
