// backend/routes/cart.js
// insertar pedidos y detalles carrito

// backend/routes/cart.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// Crear un nuevo pedido con detalle inicial
router.post("/", async (req, res) => {
  const { id_cliente, items } = req.body;

  try {
    // Insertar cabecera  Pedido
    const pedido = await pool.query(
      "INSERT INTO pedidos (id_cliente) VALUES ($1) RETURNING numcab",
      [id_cliente]
    );
    const numcab = pedido.rows[0].numcab;
    const numid = pedido.rows[0].id;

    // Insertar detalle inicial  detalle_pedido
    for (const item of items) {
      await pool.query(
        "INSERT INTO detalle_pedido (numcab, codigo_articulo, detalle_articulo, cantidad, precio) VALUES ($1, $2, $3, $4, $5)",
        [numcab, item.codigo_articulo, item.detalle_articulo, item.cantidad, item.precio]
      );
    }

    // Recalcular carrito completo
    const detalles = await pool.query(
      "SELECT id, codigo_articulo, detalle_articulo, precio, cantidad FROM detalle_pedido WHERE id=$1 and numcab=$2",
      [numid, numcab]
    );

    //const total = detalles.rows.reduce(
    //  (acc, it) => acc + Number(it.precio) * Number(it.cantidad),
    //  0
    //);

    let total = 0;
    for (const it of detalles.rows) {
      total += Number(it.precio) * Number(it.cantidad);
    }

    console.log(total)

    res.json({
      mensaje: "Pedido creado",
      numcab,
      items: detalles.rows.map(it => ({
        codigo_articulo: it.codigo_articulo,
        detalle: it.detalle_articulo,
        precio: parseFloat(it.precio),
        quantity: parseInt(it.cantidad, 10)
      })),
      total
    });
  } catch (error) {
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
        "INSERT INTO detalle_pedido (numcab, codigo_articulo, detalle_articulo, cantidad, precio) VALUES ($1, $2, $3, $4, $5)",
        [numcab, codigo_articulo, detalle_articulo, cantidad, precio]
      );
    }

    // Recalcular carrito completo
    const detalles = await pool.query(
      "SELECT id, codigo_articulo, detalle_articulo, precio, cantidad FROM detalle_pedido WHERE id=$1 and numcab=$2",
      [numid, numcab]
    );
    const total = detalles.rows.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

    res.json({
      mensaje: "Artículo agregado/actualizado",
      numcab,
      items: detalles.rows.map(it => ({
        codigo_articulo: it.codigo_articulo,
        detalle: it.detalle_articulo,
        precio: it.precio,
        quantity: it.cantidad
      })),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar artículo" });
  }
});

// Vaciar carrito
router.delete("/", async (req, res) => {
  res.json({ numcab: null, items: [], total: 0 });
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

    // Recalcular carrito completo
    const detalles = await pool.query(
      "SELECT codigo_articulo, detalle_articulo, precio, cantidad FROM detalle_pedido WHERE numcab=$1",
      [numcab]
    );
    const total = detalles.rows.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

    res.json({
      mensaje: "Cantidad actualizada",
      numcab,
      items: detalles.rows.map(it => ({
        codigo_articulo: it.codigo_articulo,
        detalle: it.detalle_articulo,
        precio: it.precio,
        quantity: it.cantidad
      })),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cantidad" });
  }
});

export default router;
