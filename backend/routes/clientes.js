// routes/clientes.js
import express from "express";
import pool from "../db.js";
const router = express.Router();

router.get("/", async (_, res) => {
    try {
        const result = await pool.query("SELECT * FROM clientes ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    const { nombre, email, telefono } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO clientes (nombre, email, telefono) VALUES ($1, $2, $3) RETURNING *",
            [nombre, email, telefono]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono } = req.body;
    try {
        const result = await pool.query(
            "UPDATE clientes SET nombre=$1, email=$2, telefono=$3 WHERE id=$4 RETURNING *",
            [nombre, email, telefono, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM clientes WHERE id=$1 RETURNING *", [id]);
        res.json({ mensaje: "Cliente eliminado", cliente: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
