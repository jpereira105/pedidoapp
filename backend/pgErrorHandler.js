// backend/pgErrorHandler.js
// pgErrorHandler.js
export function pgErrorHandler(error, res) {
    if (error.code === "23503") {
        return res.status(400).json({ error: "Referencia inválida: cliente o artículo inexistente" });
    }
    if (error.code === "23505") {
        return res.status(400).json({ error: "Ítem duplicado en el pedido" });
    }
    return res.status(500).json({ error: "Error interno en la base de datos" });
}
