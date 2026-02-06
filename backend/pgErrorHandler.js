// backend/pgErrorHandler.js

export function pgErrorHandler(error, res) {
    // Log limpio para debugging
    console.error("DB Error:", error.code, error.detail);

    switch (error.code) {
        case "23502": // NOT NULL violation
            return res.status(400).json({
                error: "Campo requerido faltante",
                detalle: error.detail,
            });

        case "22P02": // Invalid text representation (ej: precio = 'abc')
            return res.status(400).json({
                error: "Formato de dato inválido",
                detalle: error.detail,
            });

        case "23503": // Foreign key violation
            return res.status(404).json({
                error: "Referencia inexistente",
                detalle: error.detail,
            });

        case "23505": // Unique violation
            return res.status(409).json({
                error: "Duplicado no permitido",
                detalle: error.detail,
            });

        default:
            // Fallback: error interno
            return res.status(500).json({
                error: "Error interno en la base de datos",
                detalle: error.detail,
            });
    }
}
