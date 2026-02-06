// backend/routes/cart.test.js
import request from "supertest";
import app from "../index.js";
import pool from "../db.js";

describe("Carrito de pedidos", () => {
    const pedidoId = 181;
    const clienteId = 123;
    const articuloCodigo = 1;

    // --- Caso normal: agregar ítem ---
    it("Agrega ítem válido al carrito", async () => {
        const res = await request(app)
            .post("/carrito")
            .send({ numcab: pedidoId, id_cliente: clienteId, codigo_articulo: articuloCodigo, cantidad: 2 });

        expect(res.statusCode).toBe(200);
        expect(res.body.codigo_articulo).toBe(articuloCodigo);
    });

    // --- Caso límite: artículo inexistente ---
    it("Rechaza ítem con artículo inexistente", async () => {
        const res = await request(app)
            .post("/carrito")
            .send({ numcab: pedidoId, id_cliente: clienteId, codigo_articulo: 99, cantidad: 1 });

        expect(res.statusCode).toBe(404); // FK inexistente → 404
        expect(res.body.error).toBe("Referencia inexistente");
    });

    // --- Caso límite: cliente inexistente ---
    it("Rechaza ítem con cliente inexistente", async () => {
        const res = await request(app)
            .post("/carrito")
            .send({ numcab: pedidoId, id_cliente: 9999, codigo_articulo: articuloCodigo, cantidad: 1 });

        expect(res.statusCode).toBe(404); // FK inexistente → 404
        expect(res.body.error).toBe("Referencia inexistente");
    });

    // --- Caso límite: cantidad inválida ---
    it("Rechaza ítem con cantidad inválida", async () => {
        const res = await request(app)
            .post("/carrito")
            .send({ numcab: pedidoId, id_cliente: clienteId, codigo_articulo: articuloCodigo, cantidad: -5 });

        expect(res.statusCode).toBe(400); // validación → 400
        expect(res.body.error).toBeDefined();
    });

    // --- Caso límite: ítems duplicados ---
    it("Maneja ítems duplicados correctamente", async () => {
        const res = await request(app)
            .post("/carrito")
            .send({ numcab: pedidoId, id_cliente: clienteId, codigo_articulo: articuloCodigo, cantidad: 1 });

        // Puede devolver 409 (duplicado) o 200 (si tu lógica acumula cantidad)
        expect([200, 409]).toContain(res.statusCode);
    });

    // --- Caso límite: vaciar pedido inexistente ---
    it("Devuelve 404 al vaciar un pedido inexistente", async () => {
        const res = await request(app).delete("/carrito/999999");
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Pedido no encontrado");
    });
});

afterAll(async () => {
    await pool.end();
});
