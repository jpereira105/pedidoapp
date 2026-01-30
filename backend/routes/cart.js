// backend/routes/cart.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// Crear un nuevo pedido con detalle inicial
router.post("/", async (req, res) => {
  const { id_cliente, items = [] } = req.body;

  try {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("No se recibieron items para el pedido");
    }

    await pool.query("BEGIN");

    const pedido = await pool.query(
      "INSERT INTO pedidos (id_cliente) VALUES ($1) RETURNING numcab",
      [id_cliente]
    );
    const numcab = pedido.rows[0].numcab;

    console.log("Items recibidos:", items);

    for (const item of items) {
      if (!item.codigo_articulo) {
        throw new Error("Falta codigo_articulo en item");
      }
      await pool.query(
        `INSERT INTO detalle_pedido 
         (numcab, codigo_articulo, detalle_articulo, cantidad, precio) 
         VALUES ($1, $2, $3, $4, $5)`,
        [numcab, item.codigo_articulo, item.detalle_articulo, item.cantidad, item.precio]
      );
    }

    await pool.query("COMMIT");

    const detalles = await pool.query(
      "SELECT codigo_articulo, detalle_articulo, precio, cantidad FROM detalle_pedido WHERE numcab=$1",
      [numcab]
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
    console.error(error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
});

// Agregar ítem a pedido existente
router.post("/:numcab/items", async (req, res) => {
  const { numcab } = req.params;
  const { codigo_articulo, detalle_articulo, cantidad, precio } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM detalle_pedido WHERE numcab=$1 AND codigo_articulo=$2",
      [numcab, codigo_articulo]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE detalle_pedido SET cantidad = cantidad + $1 WHERE numcab=$2 AND codigo_articulo=$3",
        [cantidad, numcab, codigo_articulo]
      );
    } else {
      await pool.query(
        `INSERT INTO detalle_pedido 
         (numcab, codigo_articulo, detalle_articulo, cantidad, precio) 
         VALUES ($1, $2, $3, $4, $5)`,
        [numcab, codigo_articulo, detalle_articulo, cantidad, precio]
      );
    }

    const detalles = await pool.query(
      "SELECT codigo_articulo, detalle_articulo, precio, cantidad FROM detalle_pedido WHERE numcab=$1",
      [numcab]
    );

    const total = detalles.rows.reduce(
      (acc, it) => acc + Number(it.precio) * Number(it.cantidad),
      0
    );

    const items = detalles.rows.map((row) => ({
      codigo_articulo: row.codigo_articulo,
      detalle_articulo: row.detalle_articulo,   // 👈 nombre consistente
      precio: parseFloat(row.precio),
      cantidad: parseInt(row.cantidad, 10),
    }));

    res.json({ mensaje: "Pedido creado", numcab, items, total });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar artículo" });
  }
});

// Vaciar carrito (elimina registros en DB)
router.delete("/:numcab", async (req, res) => {
  const { numcab } = req.params;
  try {
    await pool.query("DELETE FROM detalle_pedido WHERE numcab=$1", [numcab]);
    await pool.query("DELETE FROM pedidos WHERE numcab=$1", [numcab]);
    res.json({ mensaje: "Carrito vaciado", numcab: null, items: [], total: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al vaciar carrito" });
  }
});

// Actualizar cantidad de un ítem
router.put("/:numcab/:codigo_articulo", async (req, res) => {
  const { numcab, codigo_articulo } = req.params;
  const { cantidad } = req.body;

  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }

  try {
    const result = await pool.query(
      "UPDATE detalle_pedido SET cantidad=$1 WHERE numcab=$2 AND codigo_articulo=$3 RETURNING *",
      [cantidad, numcab, codigo_articulo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }

    const detalles = await pool.query(
      "SELECT codigo_articulo, detalle_articulo, precio, cantidad FROM detalle_pedido WHERE numcab=$1",
      [numcab]
    );

    const items = detalles.rows.map(row => ({
      codigo_articulo: row.codigo_articulo,
      detalle_articulo: row.detalle_articulo,
      precio: parseFloat(row.precio),
      cantidad: parseInt(row.cantidad, 10),
    }));

    const total = items.reduce(
      (acc, it) => acc + it.precio * it.cantidad,
      0
    );

    res.json({ mensaje: "OK", numcab, items, total });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cantidad" });
  }
});

export default router;
