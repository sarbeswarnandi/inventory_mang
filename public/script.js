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
          <strong>${p.name}</strong> – Qty: ${p.quantity} – ₹${p.price}
        </div>
        <div class="product-actions">
          <button onclick="editProduct('${p._id}', '${p.name}', ${p.quantity}, ${p.price})">✏️ Edit</button>
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
  const quantity = document.getElementById('quantity').value;
  const price = document.getElementById('price').value;

  await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, quantity, price })
  });

  productForm.reset();
  fetchProducts();
});

// Edit product
async function editProduct(id, name, quantity, price) {
  const newQuantity = prompt(`Update quantity for "${name}"`, quantity);
  const newPrice = prompt(`Update price for "${name}"`, price);
  if (newQuantity === null || newPrice === null) return;

  await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quantity: parseInt(newQuantity),
      price: parseFloat(newPrice)
    })
  });

  fetchProducts();
}

// Delete product
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  });

  fetchProducts();
}
async function addQuantity(id, currentQty) {
  const input = document.getElementById(`addQty-${id}`);
  const addQty = parseInt(input.value);

  if (isNaN(addQty) || addQty <= 0) {
    alert('Please enter a valid quantity to add.');
    return;
  }

  const newQty = currentQty + addQty;

  await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: newQty })
  });

  fetchProducts(); // Refresh the list
}


async function fetchLowStock() {
  const res = await fetch(`${API_BASE}/low-stock?threshold=5`);
  const products = await res.json();

  const list = document.getElementById('lowStockList');
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
