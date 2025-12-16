// data.js
import fs from "fs";

const DATA_FILE = "./data.json";

// Si no existe, crear con datos iniciales
if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    products: [
      { id: 1, name: "Pizza", price: 1200 },
      { id: 2, name: "Empanada", price: 250 },
      { id: 3, name: "Fainá", price: 800 }
    ],
    cart: []
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

function loadData() {
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let { products, cart } = loadData();

export { products, cart, saveData, loadData };
