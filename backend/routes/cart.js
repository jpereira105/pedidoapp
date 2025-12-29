// backend/routes/cart.js
// insertar pedidos y detalles

import express from "express";
import pool from "../db.js";

const router = express.Router();

// Crear un nuevo pedido con detalle
router.post("/", async (req, res) => {
  const { id_cliente, items } = req.body;
  // items = [{codigo_articulo, detalle_articulo, cantidad}, ...]

  try {
    // Insertar cabecera
    const pedido = await pool.query(
      "INSERT INTO pedidos (id_cliente) VALUES ($1) RETURNING numcab",
      [id_cliente]
    );

    const numcab = pedido.rows[0].numcab;

    // Insertar detalle
    for (const item of items) {
      await pool.query(
        "INSERT INTO detalle_pedido (numcab, codigo_articulo, detalle_articulo, cantidad) VALUES ($1, $2, $3, $4)",
        [numcab, item.codigo_articulo, item.detalle_articulo, item.cantidad]
      );
    }

    res.json({ mensaje: "Pedido creado", numcab });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
});

export default router;
