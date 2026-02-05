// backend/routes/products.test.js
import request from "supertest";
import app from "../index.js";
import pool from "../db.js";

describe("articulos", () => {
    const codigo = 101;

    // --- Caso normal: crear producto ---
    it("Crea un producto nuevo", async () => {
        const res = await request(app)
            .post("/articulos")
            .send({
                codigo,
                detalle: "Producto Test",
                precio: 99.99,
                stock: 10
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.codigo).toBe(codigo);
    });

    // --- Caso normal: listar productos ---
    it("Lista productos", async () => {
        const res = await request(app).get("/articulos");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // --- Caso normal: obtener producto por código ---
    it("Obtiene producto por código", async () => {
        const res = await request(app).get(`/articulos/${codigo}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.codigo).toBe(codigo);
    });

    // --- Caso normal: actualizar producto ---
    it("Actualiza producto existente", async () => {
        const res = await request(app)
            .put(`/articulos/${codigo}`)
            .send({ detalle: "Producto Actualizado", precio: 120 });

        expect(res.statusCode).toBe(200);
        expect(res.body.detalle).toBe("Producto Actualizado");
    });

    // --- Caso normal: eliminar producto ---
    it("Elimina producto existente", async () => {
        const res = await request(app).delete(`/articulos/${codigo}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe("Producto eliminado");
    });

    // --- Casos límite ---
    it("Devuelve 404 al obtener producto inexistente", async () => {
        const res = await request(app).get("/articulos/999999");
        expect(res.statusCode).toBe(404);
    });

    it("Devuelve 404 al actualizar producto inexistente", async () => {
        const res = await request(app)
            .put("/articulos/999999")
            .send({ detalle_articulo: "Nada", precio: 10 });
        expect(res.statusCode).toBe(404);
    });

    it("Devuelve 404 al eliminar producto inexistente", async () => {
        const res = await request(app).delete("/articulos/999999");
        expect(res.statusCode).toBe(404);
    });
});

afterAll(async () => {
    await pool.end();
});
