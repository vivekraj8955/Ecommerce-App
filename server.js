import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoute.js";
dotenv.config();

connectDb();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.error(`  server started on port: ${PORT}`.bgGreen);
});
