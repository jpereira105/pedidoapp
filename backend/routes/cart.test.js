// backend/routes/cart.test.js
import request from "supertest";
import app from "../index.js";   // tu app Express
import pool from "../db.js";     // conexión a la base
import { jest } from "@jest/globals";

jest.setTimeout(30000); // 30 segundos

// --- Bloque CRUD Carrito ---
describe("carrito - CRUD", () => {
    let pedidoId;
    const clienteId = 1;
    const articuloCodigo = 2;

    // 🔹 Antes de cada test: limpiar tablas
    beforeEach(async () => {
        await pool.query("DELETE FROM detalle_pedido WHERE id_cliente = $1", [clienteId]);
        await pool.query("DELETE FROM pedidos WHERE id_cliente = $1", [clienteId]);
    });

    // 🔹 Después de todos los tests: cerrar conexión
    afterAll(async () => {
        await pool.end();
    });

    it("Crea un pedido con items iniciales", async () => {
        const res = await request(app)
            .post("/carrito")
            .send({
                id_cliente: clienteId,
                items: [
                    { codigo_articulo: articuloCodigo, detalle_articulo: "Empanada", cantidad: 2, precio: 500 }
                ]
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe("Pedido creado");
        pedidoId = res.body.numcab;
    });

    it("Agrega ítem válido al carrito", async () => {
        const pedido = await request(app)
            .post("/carrito")
            .send({
                id_cliente: clienteId,
                items: [
                    { codigo_articulo: articuloCodigo, detalle_articulo: "Empanada", cantidad: 2, precio: 500 }
                ]
            });
        pedidoId = pedido.body.numcab;

        const res = await request(app)
            .post(`/carrito/${pedidoId}/items`)
            .send({
                id_cliente: clienteId,
                codigo_articulo: articuloCodigo,
                detalle_articulo: "Empanada",
                cantidad: 2,
                precio: 500
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.items[0].codigo_articulo).toBe(articuloCodigo);
    });

    it("Actualiza cantidad si el ítem ya existe", async () => {
        const pedido = await request(app)
            .post("/carrito")
            .send({
                id_cliente: clienteId,
                items: [
                    { codigo_articulo: articuloCodigo, detalle_articulo: "Empanada", cantidad: 2, precio: 500 }
                ]
            });
        pedidoId = pedido.body.numcab;

        const res = await request(app)
            .post(`/carrito/${pedidoId}/items`)
            .send({
                id_cliente: clienteId,
                codigo_articulo: articuloCodigo,
                detalle_articulo: "Empanada",
                cantidad: 3,
                precio: 500
            });

        expect(res.statusCode).toBe(200);
        const item = res.body.items.find(it => it.codigo_articulo === articuloCodigo);
        expect(item.cantidad).toBe(5); // 2 iniciales + 3 nuevos
    });
});

// --- Bloque validaciones (400) ---
describe("carrito - validaciones", () => {
    const clienteId = 1;
    const pedidoId = 999999;

    it("Rechaza ítem con cantidad inválida", async () => {
        const res = await request(app)
            .put(`/carrito/${pedidoId}/123`)
            .send({ id_cliente: clienteId, cantidad: -5 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Cantidad inválida");
    });

    it("No permite crear pedido sin items", async () => {
        const res = await request(app)
            .post("/carrito")
            .send({ id_cliente: clienteId, items: [] });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("No se recibieron items para el pedido");
    });
});

// --- Bloque validaciones (400) ---
describe("carrito - validaciones", () => {
    const clienteId = 1;
    const pedidoId = 999999;

    it("Rechaza ítem con cantidad inválida", async () => {
        const res = await request(app)
            .put(`/carrito/${pedidoId}/123`)
            .send({ id_cliente: clienteId, cantidad: -5 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Cantidad inválida");
    });

    it("No permite crear pedido sin items", async () => {
        const res = await request(app)
            .post("/carrito")
            .send({ id_cliente: clienteId, items: [] });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("No se recibieron items para el pedido");
    });
});



// --- Bloque validaciones (400) ---
describe("carrito - validaciones", () => {
    const clienteId = 1;
    const pedidoId = 999999;

    it("Rechaza ítem con cantidad inválida", async () => {
        const res = await request(app)
            .put(`/carrito/${pedidoId}/123`)
            .send({ id_cliente: clienteId, cantidad: -5 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Cantidad inválida");
    });

    it("No permite crear pedido sin items", async () => {
        const res = await request(app)
            .post("/carrito")
            .send({ id_cliente: clienteId, items: [] });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("No se recibieron items para el pedido");
    });
});

// --- Teardown de datos de prueba ---
// afterAll(async () => {
//    await pool.query("DELETE FROM detalle_pedido WHERE id_cliente = 1");
//    await pool.query("DELETE FROM pedidos WHERE id_cliente = 1");
//    await pool.query("DELETE FROM clientes WHERE id_cliente = 1");
//    await pool.query("DELETE FROM articulos WHERE codigo = 2");
//    await pool.end();
// });
