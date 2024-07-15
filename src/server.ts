import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/db";
import jwtKeyCheck from "./config/jwtKeyCheck";

dotenv.config();

jwtKeyCheck();

const PORT = process.env.PORT || 8080;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;
