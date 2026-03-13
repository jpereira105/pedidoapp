// src/App.jsx
import { useState, useEffect } from "react";

function App() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cart, setCart] = useState({ numcab: null, items: [], total: 0 });

  useEffect(() => {
    fetch("http://localhost:4000/clientes")
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => console.error("Error cargando clientes:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:4000/articulos")
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    fetch("http://localhost:4000/carrito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_cliente: cliente.id_cliente, items: [] })
    })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error("Error creando pedido:", err));
  };

  const addToCart = (producto) => {
    const item = {
      id_cliente: clienteSeleccionado.id_cliente,
      codigo_articulo: producto.codigo,
      detalle_articulo: producto.detalle,
      precio: producto.precio,
      cantidad: 1
    };

    fetch(`http://localhost:4000/carrito/${cart.numcab}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error("Error agregando ítem:", err));
  };

  const updateQuantity = (codigo_articulo, nuevaCantidad) => {
    fetch(`http://localhost:4000/carrito/${cart.numcab}/${codigo_articulo}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_cliente: clienteSeleccionado.id_cliente, cantidad: nuevaCantidad })
    })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error("Error actualizando cantidad:", err));
  };

  const emptyCart = () => {
    fetch(`http://localhost:4000/carrito/${cart.numcab}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_cliente: clienteSeleccionado.id_cliente })
    })
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error("Error vaciando carrito:", err));
  };

  const finalizarPedido = () => {
    if (window.confirm("¿Desea finalizar el pedido?")) {
      setCart({ numcab: null, items: [], total: 0 });
      setClienteSeleccionado(null);
    }
  };

  return (
    <div>
      <h1>PedidoApp</h1>

      {!clienteSeleccionado ? (
        <div>
          <h2>Seleccione un cliente</h2>
          {clientes.map(c => (
            <div key={c.id_cliente}>
              <span>{c.nombre}</span>
              <button onClick={() => seleccionarCliente(c)}>Seleccionar</button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2>Cliente: {clienteSeleccionado.nombre}</h2>

          <h2>Productos</h2>
          {productos.map(p => (
            <div key={p.codigo}>
              <span>{p.detalle} - ${p.precio}</span>
              <button onClick={() => addToCart(p)}>Agregar</button>
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
                      onClick={() => updateQuantity(item.codigo_articulo, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.codigo_articulo, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <h3>Total: ${cart.total}</h3>
              <button onClick={emptyCart}>Vaciar carrito</button>
              <button onClick={finalizarPedido}>Finalizar pedido</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
