// routes/pedidos.js
import express from "express";
import pool from "../db.js";
const router = express.Router();

router.get("/", async (_, res) => {
    try {
        const result = await pool.query(`
      SELECT p.numcab, p.fecha, c.nombre AS cliente
      FROM pedidos p
      JOIN clientes c ON p.id_cliente = c.id
      ORDER BY p.numcab
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:numcab", async (req, res) => {
    const { numcab } = req.params;
    try {
        const pedido = await pool.query("SELECT * FROM pedidos WHERE numcab=$1", [numcab]);
        const detalles = await pool.query("SELECT * FROM detalle_pedido WHERE numcab=$1", [numcab]);
        res.json({ pedido: pedido.rows[0], detalles: detalles.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:numcab", async (req, res) => {
    const { numcab } = req.params;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("DELETE FROM detalle_pedido WHERE numcab=$1", [numcab]);
        const result = await client.query("DELETE FROM pedidos WHERE numcab=$1 RETURNING *", [numcab]);
        await client.query("COMMIT");
        res.json({ mensaje: "Pedido eliminado", pedido: result.rows[0] });
    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

export default router;

