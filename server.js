import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoute.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

connectDb();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "./client/build")));

app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "/client/build"));
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.error(`  server started on port: ${PORT}`.bgGreen);
});
