// backend/index.js
// los routers usan la base Supabase

import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/products", productsRouter);
app.use("/cart", cartRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});