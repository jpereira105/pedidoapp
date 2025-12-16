import { Router } from "express";
import { products } from "../data.js";

const router = Router();

// GET /products
router.get("/", (req, res) => {
  res.json(products);
});

export default router;
