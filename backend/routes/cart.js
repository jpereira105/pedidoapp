// routes/cart.js
import { Router } from "express";
import { products, cart, saveData, loadData } from "../data.js";

const router = Router();

// GET /cart
router.get("/", (req, res) => {
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({ items: cart, total });
});

// POST /cart
router.post("/", (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

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

  saveData({ products, cart }); // guardar cambios

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  res.json({ items: cart, total });
});

// DELETE /cart
router.delete("/", (req, res) => {
  cart.length = 0;
  saveData({ products, cart }); // guardar cambios
  res.json({ items: cart, total: 0 });
});

export default router;
