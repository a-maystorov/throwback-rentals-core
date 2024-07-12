export default function () {
  if (!process.env.JWT_KEY) {
    throw new Error("FATAL ERROR: JWT Key is not defined.");
  }
}
