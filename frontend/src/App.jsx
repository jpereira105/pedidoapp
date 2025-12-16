// src/app.jsx
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [error, setError] = useState(false);

  // Traer productos
  useEffect(() => {
    fetch("http://localhost:4000/products")
      .then(res => {
        if (!res.ok) throw new Error("Error en productos");
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => {
        console.error("Error al conectar con productos:", err);
        setError(true);
      });
  }, []);

  // Actualizar título del navegador con el total del carrito
  useEffect(() => {
    document.title = `🛒 Total: $${cart.total}`;
  }, [cart.total]);

  // Agregar al carrito
  const addToCart = (p) => {
    fetch("http://localhost:4000/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: p.id, quantity: 1 })
    })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => {
        console.error("Error al agregar al carrito:", err);
        setError(true);
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>PedidoApp</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          ❌ No se pudo conectar con el servidor. Intenta más tarde.
        </div>
      )}

      <h2>Productos</h2>
      {products.map(p => (
        <div key={p.id}>
          {p.name} - ${p.price}
          <button onClick={() => addToCart(p)}>Agregar</button>
        </div>
      ))}

      <h2>Carrito</h2>
      {cart.items.map((c, i) => (
        <div key={i}>
          {c.name} - ${c.price} x {c.quantity}
        </div>
      ))}
      <h3>Total: ${cart.total}</h3>
    </div>
  );
}

export default App;
