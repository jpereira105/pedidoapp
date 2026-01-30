// src/app.jsx
import { useState, useEffect } from "react";

function App() {
  const [productos, setProductos] = useState([]);
  const [cart, setCart] = useState({ numcab: null, items: [], total: 0 });

  // Cargar productos desde tu backend
  useEffect(() => {
    fetch("http://localhost:4000/products")
      .then(res => res.json())
      .then(data => {
        console.log("Productos:", data);
        setProductos(data);
      })
      .catch(err => console.error(err));
  }, []);

  // Crear pedido / agregar al carrito
  const addToCart = (producto) => {
    const item = {
      codigo_articulo: producto.codigo,
      detalle_articulo: producto.detalle,
      precio: producto.precio,
      cantidad: 1
    };

    if (!cart.numcab) {
      fetch("http://localhost:4000/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cliente: 1, items: [item] })
      })
        .then(res => res.json())
        .then(data => setCart(data))
        .catch(err => console.error("Error creando pedido:", err));
    } else {
      fetch(`http://localhost:4000/cart/${cart.numcab}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      })
        .then(res => res.json())
        .then(data => setCart(data))
        .catch(err => console.error("Error agregando ítem:", err));
    }
  };

  // Vaciar carrito
  const emptyCart = () => {
    fetch(`http://localhost:4000/cart/${cart.numcab}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error(err));
  };

  // Actualizar cantidad
  const updateQuantity = (numcab, codigo_articulo, nuevaCantidad) => {
    fetch(`http://localhost:4000/cart/${numcab}/${codigo_articulo}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad: nuevaCantidad })
    })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h1>PedidoApp</h1>

      <h2>Productos</h2>
      {productos.map(p => (
        <div key={p.codigo}>
          <span>{p.detalle} - ${p.precio}</span>
          <button onClick={() => addToCart(p)}>Agregar al carrito</button>
        </div>
      ))}

      <h2>Carrito</h2>
      {cart.items.length === 0 ? (
        <p>Carrito vacío</p>
      ) : (
        <div>
          {cart.items.map(item => (
            <div key={item.codigo_articulo}>
              <span>{item.detalle_articulo} - ${item.precio}</span>
              <div>
                <button
                  onClick={() =>
                    updateQuantity(cart.numcab, item.codigo_articulo, item.cantidad - 1)
                  }
                  disabled={item.cantidad <= 1}
                >
                  -
                </button>
                <span>{item.cantidad}</span>
                <button
                  onClick={() =>
                    updateQuantity(cart.numcab, item.codigo_articulo, item.cantidad + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {/* 👇 fuera del map */}
          <h3>Total: ${cart.total}</h3>
          <button onClick={emptyCart}>Vaciar carrito</button>
        </div>
      )}
    </div>
  );
}

export default App;
