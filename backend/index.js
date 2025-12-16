const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Aquí definís los datos en el backend
let products = [
  { id: 1, name: 'Café', price: 500 },
  { id: 2, name: 'Té', price: 300 }
];

let cart = [];

// Endpoints
app.get('/products', (req, res) => res.json(products));

app.get('/cart', (req, res) => res.json(cart));

app.post('/cart', (req, res) => {
  cart.push(req.body); // { productId, quantity }
  res.json(cart);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
