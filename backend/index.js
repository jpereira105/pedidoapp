// backend/index.js
import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import clientesRouter from "./routes/clientes.js";
import pedidosRouter from "./routes/pedidos.js";

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/clientes", clientesRouter);
app.use("/pedidos", pedidosRouter);

// Middleware global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Solo levantar servidor si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
  });
}

// 👉 Exportar la app para Supertest
export default app;


