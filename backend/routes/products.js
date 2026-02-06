// backend/routes/products.js
import express from "express";
import pool from "../db.js";
import { pgErrorHandler } from "../pgErrorHandler.js";

const router = express.Router();

// Crear artículo
router.post("/", async (req, res) => {
  const { codigo, detalle, precio, stock } = req.body;

  // Validación previa de campos obligatorios
  if (!codigo || !detalle || !precio || stock == null) {
    return res.status(400).json({ error: "Campos obligatorios faltantes" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO articulos (codigo, detalle, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *",
      [codigo, detalle, precio, stock]
    );
    res.status(201).json(result.rows[0]); // 201 Created
  } catch (error) {
    pgErrorHandler(error, res);
  }
});

// Listar artículos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM articulos");
    res.json(result.rows);
  } catch (error) {
    pgErrorHandler(error, res);
  }
});

// Obtener artículo por código
router.get("/:codigo", async (req, res) => {
  const { codigo } = req.params;
  try {
    const result = await pool.query("SELECT * FROM articulos WHERE codigo=$1", [codigo]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    pgErrorHandler(error, res);
  }
});

// Actualizar artículo
router.put("/:codigo", async (req, res) => {
  const { codigo } = req.params;
  const { detalle, precio, stock } = req.body;

  // Validación: body vacío
  if (!detalle && !precio && stock == null) {
    return res.status(400).json({ error: "Body vacío o campos inválidos" });
  }

  try {
    const result = await pool.query(
      "UPDATE articulos SET detalle=$1, precio=$2, stock=$3 WHERE codigo=$4 RETURNING *",
      [detalle, precio, stock, codigo]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    pgErrorHandler(error, res);
  }
});

// Eliminar artículo
router.delete("/:codigo", async (req, res) => {
  const { codigo } = req.params;
  try {
    const result = await pool.query("DELETE FROM articulos WHERE codigo=$1 RETURNING *", [codigo]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.json({ mensaje: "Producto eliminado", codigo });
  } catch (error) {
    pgErrorHandler(error, res);
  }
});

export default router;




