// backend/routes/products.test.js
import request from "supertest";
import app from "../index.js";
import pool from "../db.js";

// --- Bloque CRUD ---
describe("articulos - CRUD", () => {
    const codigo = 101;

    it("Crea un producto nuevo", async () => {
        const res = await request(app)
            .post("/articulos")
            .send({ codigo, detalle: "Producto Test", precio: 99.99, stock: 10 });

        expect(res.statusCode).toBe(201); // ahora devuelve 201 Created
        expect(res.body.codigo).toBe(codigo);
    });

    it("Lista productos", async () => {
        const res = await request(app).get("/articulos");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("Obtiene producto por código", async () => {
        const res = await request(app).get(`/articulos/${codigo}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.codigo).toBe(codigo);
    });

    it("Actualiza producto existente", async () => {
        const res = await request(app)
            .put(`/articulos/${codigo}`)
            .send({ detalle: "Producto Actualizado", precio: 120, stock: 5 }); // stock agregado para evitar NOT NULL

        expect(res.statusCode).toBe(200);
        expect(res.body.detalle).toBe("Producto Actualizado");
    });

    it("Elimina producto existente", async () => {
        const res = await request(app).delete(`/articulos/${codigo}`);
        expect(res.statusCode).toBe(200); // o 204 si decides no devolver body
        expect(res.body.mensaje).toBe("Producto eliminado");
    });
});

// --- Bloque límites (404) ---
describe("articulos - límites", () => {
    it("Devuelve 404 al obtener producto inexistente", async () => {
        const res = await request(app).get("/articulos/999999");
        expect(res.statusCode).toBe(404);
    });

    it("Devuelve 404 al actualizar producto inexistente", async () => {
        const res = await request(app)
            .put("/articulos/999999")
            .send({ detalle: "Nada", precio: 10, stock: 1 });
        expect(res.statusCode).toBe(404);
    });

    it("Devuelve 404 al eliminar producto inexistente", async () => {
        const res = await request(app).delete("/articulos/999999");
        expect(res.statusCode).toBe(404);
    });
});

// --- Bloque validaciones (400) ---
describe("articulos - validaciones", () => {
    it("No permite crear producto sin detalle", async () => {
        const res = await request(app)
            .post("/articulos")
            .send({ codigo: 202, precio: 50, stock: 5 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Campo requerido faltante");
    });

    it("No permite crear producto con precio inválido", async () => {
        const res = await request(app)
            .post("/articulos")
            .send({ codigo: 203, detalle: "Test inválido", precio: "abc", stock: 5 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/precio/i); // coincide con "Precio inválido"
    });

    it("No permite actualizar con body vacío", async () => {
        const res = await request(app).put("/articulos/101").send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Body vacío o campos inválidos");
    });
});

// --- Cierre de conexiones ---
afterAll(async () => {
    await pool.end();
});
