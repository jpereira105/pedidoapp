import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Traer productos del backend
  useEffect(() => {
    fetch("http://localhost:4000/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // Agregar producto al carrito
  const addToCart = (p) => {
    fetch("http://localhost:4000/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: p.id, quantity: 1 })
    })
      .then(res => res.json())
      .then(data => setCart(data));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>PedidoApp</h1>

      <h2>Productos</h2>
      {products.map(p => (
        <div key={p.id}>
          {p.name} - ${p.price}
          <button onClick={() => addToCart(p)}>Agregar</button>
        </div>
      ))}

      <h2>Carrito</h2>
      {cart.map((c, i) => (
        <div key={i}>
          Producto ID: {c.productId} x {c.quantity}
        </div>
      ))}
    </div>
  );
}

export default App;
