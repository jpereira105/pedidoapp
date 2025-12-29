// backend/test.js
import pool from "./db.js";

async function testDB() {
    try {
        // Consulta simple para verificar conexión
        const result = await pool.query("SELECT NOW()");
        console.log("Conexión OK, fecha del servidor:", result.rows[0]);

        // Consulta a la tabla articulos (si ya la creaste en Supabase)
        const articulos = await pool.query("SELECT * FROM articulos");
        console.log("Artículos:", articulos.rows);
    } catch (error) {
        console.error("Error de conexión:", error);
    } finally {
        pool.end(); // cerrar conexión
    }
}

testDB();
