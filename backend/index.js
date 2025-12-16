import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/products", productsRouter);
app.use("/cart", cartRouter);

app.listen(4000, () => {
  console.log("API corriendo en http://localhost:4000");
});
