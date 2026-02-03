// Instalar dependencias
// bash
// npm install--save - dev jest supertest
// jest: framework de testing.

//    supertest: para simular requests HTTP a tu API.
// cart.test.js
import request from "supertest";
import app from "../index.js";
import pool from "../db.js"; // conexión a la base

describe("Carrito de pedidos", () => {
    let numcab;
    const id_cliente = 123;

    // Crear cliente de prueba antes de todos los tests
    beforeAll(async () => {
        await pool.query(
            "INSERT INTO clientes (id_cliente, nombre) VALUES ($1, $2) ON CONFLICT (id_cliente) DO NOTHING",
            [id_cliente, "Cliente Test"]
        );
    });

    it("Crea un pedido con ítems iniciales", async () => {
        const res = await request(app)
            .post("/cart")
            .send({
                id_cliente,
                items: [
                    { codigo_articulo: 1, detalle_articulo: "Producto A", cantidad: 2, precio: 100 },
                    { codigo_articulo: 2, detalle_articulo: "Producto B", cantidad: 1, precio: 50 }
                ]
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(250);
        numcab = res.body.numcab;
    });

    it("Agrega un ítem al pedido existente", async () => {
        const res = await request(app)
            .post(`/cart/${numcab}/items`)
            .send({
                id_cliente,
                codigo_articulo: 3,
                detalle_articulo: "Producto C",
                cantidad: 3,
                precio: 20
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBeGreaterThan(250);
    });

    it("Actualiza cantidad de un ítem", async () => {
        const res = await request(app)
            .put(`/cart/${numcab}/1`)
            .send({ id_cliente, codigo_articulo: 1, cantidad: 5 });

        expect(res.statusCode).toBe(200);
        expect(res.body.items.find(i => i.codigo_articulo === 1).cantidad).toBe(5);
    });


    it("Vacía el carrito", async () => {
        const res = await request(app)
            .delete(`/cart/${numcab}`)
            .send({ id_cliente });

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(0);
        expect(res.body.items.length).toBe(0);
    });
});

afterAll(async () => {
    await pool.end();
});
