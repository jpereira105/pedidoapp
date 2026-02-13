// backend/routes/products.test.js
import request from "supertest";
import app from "../index.js";
import pool from "../db.js";

// --- Setup de datos de prueba ---
beforeAll(async () => {
    await pool.query(
        "INSERT INTO articulos (codigo, detalle, precio, stock) VALUES (100, 'Producto Test', 999, 5)"
    );
});

beforeEach(async () => {
    await pool.query("DELETE FROM articulos WHERE codigo IN (101, 104, 105)");
});

afterAll(async () => {
    await pool.query("DELETE FROM articulos WHERE codigo = 100");
    await pool.end();
});


// --- Bloque CRUD Productos ---
describe("articulos - CRUD", () => {
    it("Crea un producto nuevo", async () => {
        const codigoUnico = Date.now() % 100000; // últimos 5 dígitos
        const res = await request(app)
            .post("/articulos")
            .send({ codigo: codigoUnico, detalle: "Nuevo Producto", precio: 500, stock: 10 });

        expect(res.statusCode).toBe(201);
        expect(res.body.detalle).toBe("Nuevo Producto");
    });


    it("Lista productos", async () => {
        const res = await request(app).get("/articulos");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("Obtiene producto por código", async () => {
        const res = await request(app).get("/articulos/100");
        expect(res.statusCode).toBe(200);
        expect(res.body.detalle).toBe("Producto Test");
    });

    it("Actualiza producto existente", async () => {
        const res = await request(app)
            .put("/articulos/100")
            .send({ detalle: "Producto Actualizado", precio: 1200, stock: 8 });

        expect(res.statusCode).toBe(200);
        expect(res.body.detalle).toBe("Producto Actualizado");
    });

    it("Elimina producto existente", async () => {
        const res = await request(app).delete("/articulos/100");
        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe("Producto eliminado");
    });
});

// --- Bloque límites (404) ---
describe("articulos - límites", () => {
    it("Devuelve 404 al obtener producto inexistente", async () => {
        const res = await request(app).get("/articulos/999999");
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Artículo no encontrado"); // coincide con tu backend
    });
});

// --- Bloque validaciones (400) ---
describe("articulos - validaciones", () => {
    it("No permite crear producto sin detalle", async () => {
        const res = await request(app)
            .post("/articulos")
            .send({ codigo: 102, precio: 500, stock: 5 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Campos obligatorios faltantes"); // coincide con tu backend
    });

    it("No permite crear producto con precio inválido", async () => {
        const res = await request(app)
            .post("/articulos")
            .send({ codigo: 105, detalle: "Producto Inválido", precio: "abc", stock: 5 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Precio inválido"); // coincide con tu backend
    });

});


