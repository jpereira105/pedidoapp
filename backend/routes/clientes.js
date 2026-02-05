// routes/clientes.js
import express from "express";
import pool from "../db.js";
import { pgErrorHandler } from "../pgErrorHandler.js";

const router = express.Router();

// Crear cliente
router.post("/", async (req, res) => {
    const { id_cliente, nombre } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO clientes (id_cliente, nombre) VALUES ($1, $2) RETURNING *",
            [id_cliente, nombre]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("DB Error:", error.code, error.detail);
        pgErrorHandler(error, res);
    }
});

// Obtener clientes
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM clientes");
        res.json(result.rows);
    } catch (error) {
        console.error("DB Error:", error.code, error.detail);
        pgErrorHandler(error, res);
    }
});

export default router;
