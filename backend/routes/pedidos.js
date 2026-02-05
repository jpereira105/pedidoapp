// routes/pedidos.js
import express from "express";
import pool from "../db.js";
import { pgErrorHandler } from "../pgErrorHandler.js";

const router = express.Router();

// Crear pedido vacío
router.post("/", async (req, res) => {
    const { id_cliente } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO pedidos (id_cliente) VALUES ($1) RETURNING *",
            [id_cliente]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("DB Error:", error.code, error.detail);
        pgErrorHandler(error, res);
    }
});

// Listar pedidos
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM pedidos");
        res.json(result.rows);
    } catch (error) {
        console.error("DB Error:", error.code, error.detail);
        pgErrorHandler(error, res);
    }
});

// Obtener pedido por numcab
router.get("/:numcab", async (req, res) => {
    const { numcab } = req.params;
    try {
        const result = await pool.query("SELECT * FROM pedidos WHERE numcab=$1", [numcab]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("DB Error:", error.code, error.detail);
        pgErrorHandler(error, res);
    }
});

export default router;

