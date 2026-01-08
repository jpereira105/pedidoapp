// maneja la conexion 
// backend/db.js
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

console.log("DB URL:", process.env.SUPABASE_DB_URL);

const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
});

export default pool;





