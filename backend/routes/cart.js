// backend/routes/cart.js
// backend/routes/cart.js
import express from "express";
import pool from "../db.js";
import { pgErrorHandler } from "../pgErrorHandler.js";

const router = express.Router();

// Crear un nuevo pedido con detalle inicial
router.post("/", async (req, res) => {
  const { id_cliente, items = [] } = req.body;

  try {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No se recibieron items para el pedido" });
    }

    await pool.query("BEGIN");

    const pedido = await pool.query(
      "INSERT INTO pedidos (id_cliente) VALUES ($1) RETURNING numcab",
      [id_cliente]
    );
    const numcab = pedido.rows[0].numcab;

    for (const item of items) {
      await pool.query(
        `INSERT INTO detalle_pedido 
         (numcab, id_cliente, codigo_articulo, detalle_articulo, cantidad, precio) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [numcab, id_cliente, item.codigo_articulo, item.detalle_articulo, item.cantidad, item.precio]
      );
    }

    await pool.query("COMMIT");

    const detalles = await pool.query(
      "SELECT codigo_articulo, detalle_articulo, precio, cantidad FROM detalle_pedido WHERE numcab=$1 AND id_cliente=$2",
      [numcab, id_cliente]
    );

    const total = detalles.rows.reduce(
      (acc, it) => acc + Number(it.precio) * Number(it.cantidad),
      0
    );

    const carritoItems = detalles.rows.map(row => ({
      codigo_articulo: row.codigo_articulo,
      detalle_articulo: row.detalle_articulo,
      precio: parseFloat(row.precio),
      cantidad: parseInt(row.cantidad, 10),
    }));

    res.json({ mensaje: "Pedido creado", numcab, items: carritoItems, total });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("DB Error:", error.code, error.detail); // 👈 logging limpio
    pgErrorHandler(error, res);
  }
});

// Agregar ítem a pedido existente
router.post("/:numcab/items", async (req, res) => {
  const { numcab } = req.params;
  const { id_cliente, codigo_articulo, detalle_articulo, cantidad, precio } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM detalle_pedido WHERE numcab=$1 AND id_cliente=$2 AND codigo_articulo=$3",
      [numcab, id_cliente, codigo_articulo]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE detalle_pedido SET cantidad = cantidad + $1 WHERE numcab=$2 AND id_cliente=$3 AND codigo_articulo=$4",
        [cantidad, numcab, id_cliente, codigo_articulo]
      );
    } else {
      await pool.query(
        `INSERT INTO detalle_pedido 
         (numcab, id_cliente, codigo_articulo, detalle_articulo, cantidad, precio) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [numcab, id_cliente, codigo_articulo, detalle_articulo, cantidad, precio]
      );
    }

    const detalles = await pool.query(
      "SELECT codigo_articulo, detalle_articulo, precio, cantidad FROM detalle_pedido WHERE numcab=$1 AND id_cliente=$2",
      [numcab, id_cliente]
    );

    const total = detalles.rows.reduce(
      (acc, it) => acc + Number(it.precio) * Number(it.cantidad),
      0
    );

    const items = detalles.rows.map(row => ({
      codigo_articulo: row.codigo_articulo,
      detalle_articulo: row.detalle_articulo,
      precio: parseFloat(row.precio),
      cantidad: parseInt(row.cantidad, 10),
    }));

    res.json({ mensaje: "Pedido actualizado", numcab, items, total });
  } catch (error) {
    console.error("DB Error:", error.code, error.detail); // 👈 logging limpio
    pgErrorHandler(error, res);
  }
});

// Vaciar carrito
router.delete("/:numcab", async (req, res) => {
  const { numcab } = req.params;
  const { id_cliente } = req.body;

  try {
    const pedido = await pool.query(
      "SELECT 1 FROM pedidos WHERE numcab=$1 AND id_cliente=$2",
      [numcab, id_cliente]
    );

    if (pedido.rowCount === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    await pool.query("DELETE FROM detalle_pedido WHERE numcab=$1 AND id_cliente=$2", [numcab, id_cliente]);
    await pool.query("DELETE FROM pedidos WHERE numcab=$1 AND id_cliente=$2", [numcab, id_cliente]);

    res.json({ mensaje: "Carrito vaciado", numcab: null, items: [], total: 0 });
  } catch (error) {
    console.error("DB Error:", error.code, error.detail); // 👈 logging limpio
    pgErrorHandler(error, res);
  }
});

// Actualizar cantidad de un ítem
router.put("/:numcab/:codigo_articulo", async (req, res) => {
  const { numcab, codigo_articulo } = req.params;
  const { id_cliente, cantidad } = req.body;

  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }

  try {
    const result = await pool.query(
      "UPDATE detalle_pedido SET cantidad=$1 WHERE numcab=$2 AND id_cliente=$3 AND codigo_articulo=$4 RETURNING *",
      [cantidad, numcab, id_cliente, codigo_articulo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }

    const detalles = await pool.query(
      "SELECT codigo_articulo, detalle_articulo, precio, cantidad FROM detalle_pedido WHERE numcab=$1 AND id_cliente=$2",
      [numcab, id_cliente]
    );

    const items = detalles.rows.map(row => ({
      codigo_articulo: row.codigo_articulo,
      detalle_articulo: row.detalle_articulo,
      precio: parseFloat(row.precio),
      cantidad: parseInt(row.cantidad, 10),
    }));

    const total = items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

    res.json({ mensaje: "OK", numcab, items, total });
  } catch (error) {
    console.error("DB Error:", error.code, error.detail); // 👈 logging limpio
    pgErrorHandler(error, res);
  }
});

export default router;
