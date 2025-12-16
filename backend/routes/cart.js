import { Router } from "express";
import { products, cart } from "../data.js";

const router = Router();

// GET /cart
router.get("/", (req, res) => {
  // Calcular total del carrito
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  res.json({
    items: cart,
    total
  });
});

// POST /cart
router.post("/", (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  // Buscar si ya existe en el carrito
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity
    });
  }

  // Calcular total actualizado
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  res.json({
    items: cart,
    total
  });
});

// DELETE /cart/:id
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = cart.findIndex(item => item.productId === id);

  if (index === -1) {
    return res.status(404).json({ error: "Producto no está en el carrito" });
  }

  cart.splice(index, 1);

  // Calcular total actualizado
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  res.json({
    items: cart,
    total
  });
});

export default router;
