const API_BASE = 'http://localhost:5000/api/products';
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');

// Fetch and display products
async function fetchProducts() {
  const res = await fetch(API_BASE);
  const products = await res.json();

  productList.innerHTML = '';
  products.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="product-row">
        <div class="product-info">
          <strong>${p.name}</strong> – Qty: ${p.quantity} – ₹${p.price} (Cost ₹${p.costPrice}) – Threshold: ${p.lowStockThreshold || 10}
        </div>
        <div class="product-actions">
          <button onclick="editProduct('${p._id}', '${p.name}', ${p.quantity}, ${p.price}, ${p.costPrice}, ${p.lowStockThreshold})">✏️ Edit</button>
          <button onclick="deleteProduct('${p._id}')">❌ Delete</button>
          <input type="number" min="1" placeholder="Add Qty" id="addQty-${p._id}" style="width:80px; margin-left:10px;" />
          <button onclick="addQuantity('${p._id}', ${p.quantity})">➕ Add</button>
        </div>
      </div>
    `;
    productList.appendChild(li);
  });
}

// Add product
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  const price = parseFloat(document.getElementById('price').value);
  const costPrice = parseFloat(document.getElementById('costPrice').value);
  const lowStockThreshold = parseInt(document.getElementById('lowStockThreshold').value) || 10;

  if (!name || isNaN(quantity) || isNaN(price) || isNaN(costPrice)) {
    alert("All fields are required");
    return;
  }

  await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, quantity, price, costPrice, lowStockThreshold })
  });

  productForm.reset();
  fetchProducts();
  fetchLowStock();
});

// Edit product
async function editProduct(id, name, quantity, price, costPrice, threshold) {
  const newQuantity = prompt(`New quantity for "${name}"`, quantity);
  const newPrice = prompt(`New price for "${name}"`, price);
  const newCost = prompt(`New cost price for "${name}"`, costPrice);
  const newThreshold = prompt(`New stock threshold for "${name}"`, threshold);

  if ([newQuantity, newPrice, newCost, newThreshold].includes(null)) return;

  await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quantity: parseInt(newQuantity),
      price: parseFloat(newPrice),
      costPrice: parseFloat(newCost),
      lowStockThreshold: parseInt(newThreshold)
    })
  });

  fetchProducts();
  fetchLowStock();
}

// Delete product
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  });

  fetchProducts();
  fetchLowStock();
}

// Add quantity to existing product
async function addQuantity(id, currentQty) {
  const input = document.getElementById(`addQty-${id}`);
  const addQty = parseInt(input.value);

  if (isNaN(addQty) || addQty <= 0) {
    alert('Please enter a valid quantity to add.');
    return;
  }

  const newQty = currentQty + addQty;

  await fetch(`${API_BASE}/${id}/add`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantityToAdd: addQty })
  });

  fetchProducts();
  fetchLowStock();
}

// Fetch products that are low on stock (threshold = 10)
async function fetchLowStock() {
  const res = await fetch(`${API_BASE}/low-stock?threshold=10`);
  const products = await res.json();

  const list = document.getElementById('lowStockList');
  if (!list) return;

  list.innerHTML = '';

  if (products.length === 0) {
    list.innerHTML = '<li>All stocks are sufficient ✅</li>';
    return;
  }

  products.forEach(p => {
    const li = document.createElement('li');
    li.style.background = '#fff3cd';
    li.style.borderLeft = '5px solid #f59e0b';
    li.innerHTML = `<strong>${p.name}</strong> – Only ${p.quantity} left`;
    list.appendChild(li);
  });
}

fetchProducts();
fetchLowStock();
