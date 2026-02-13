// backend/pgErrorHandler.js
import { ERRORS } from "./errors.js";

export function pgErrorHandler(error, res) {
    console.error("DB Error:", error.code, error.detail);

    switch (error.code) {
        case "23502": // NOT NULL violation
            return res.status(400).json({ error: ERRORS.NOT_NULL, detalle: error.detail });

        case "22P02": // Invalid text representation
            return res.status(400).json({ error: ERRORS.INVALID_FORMAT, detalle: error.detail });

        case "23503": // Foreign key violation
            return res.status(404).json({ error: ERRORS.FK_VIOLATION, detalle: error.detail });

        case "23505": // Unique violation
            return res.status(409).json({ error: ERRORS.UNIQUE_VIOLATION, detalle: error.detail });

        default:
            return res.status(500).json({ error: ERRORS.INTERNAL, detalle: error.detail });
    }
}
