// backend/routes/products.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// Obtener todos los artículos (Read)
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM articulos ORDER BY CODIGO");
    res.json(result.rows);
  } catch (error) {
    next(error); // delega al middleware global
  }
});

// Obtener un artículo por CODIGO (Read)
router.get("/:CODIGO", async (req, res, next) => {
  const { CODIGO } = req.params;
  if (isNaN(CODIGO)) return res.status(400).json({ error: "Código inválido" });

  try {
    const result = await pool.query("SELECT * FROM articulos WHERE CODIGO = $1", [CODIGO]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Crear un nuevo artículo (Create)
router.post("/", async (req, res, next) => {
  const { detalle, precio, stock } = req.body;

  // Validaciones simples
  if (!detalle || typeof detalle !== "string") {
    return res.status(400).json({ error: "Detalle inválido" });
  }
  if (isNaN(precio) || precio <= 0) {
    return res.status(400).json({ error: "Precio inválido" });
  }
  if (isNaN(stock) || stock < 0) {
    return res.status(400).json({ error: "Stock inválido" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO articulos (detalle, precio, stock) VALUES ($1, $2, $3) RETURNING *",
      [detalle, precio, stock]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Actualizar un artículo por CODIGO (Update)
router.put("/:CODIGO", async (req, res, next) => {
  const { CODIGO } = req.params;
  const { detalle, precio, stock } = req.body;

  try {
    const result = await pool.query(
      "UPDATE articulos SET detalle=$1, precio=$2, stock=$3 WHERE CODIGO=$4 RETURNING *",
      [detalle, precio, stock, CODIGO]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Eliminar un artículo por CODIGO (Delete)
router.delete("/:CODIGO", async (req, res, next) => {
  const { CODIGO } = req.params;
  try {
    const result = await pool.query("DELETE FROM articulos WHERE CODIGO=$1 RETURNING *", [CODIGO]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.json({ mensaje: "Artículo eliminado", articulo: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
