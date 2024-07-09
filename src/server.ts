import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/db";

dotenv.config();

// TODO: export this from own file
if (!process.env.JWT_KEY) {
  console.error("ERROR: JWT Key is not defined.");
  process.exit(1);
}

const PORT = process.env.PORT || 8080;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { server };
