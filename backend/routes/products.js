// backend/routes/products.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// Obtener todos los artículos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM articulos");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener artículos" });
  }
});

export default router;
