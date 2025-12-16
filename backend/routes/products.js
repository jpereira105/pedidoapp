//routes/products.js

import { Router } from "express";
import { products, cart, saveData } from "../data.js";

const router = Router();

// GET /products → lista de productos
router.get("/", (req, res) => {
  res.json(products);
});

// POST /products → agregar nuevo producto
router.post("/", (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Faltan campos: name y price" });
  }

  const newProduct = {
    id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
    name,
    price
  };

  products.push(newProduct);
  saveData({ products, cart }); // persistir en data.json

  res.status(201).json(newProduct);
});

export default router;
