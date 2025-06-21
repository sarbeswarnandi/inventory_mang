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
  fetchProducts(); // refresh list
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

  fetchProducts(); // Refresh
}

// Delete product
async function deleteProduct(id) {
  const confirmDelete = confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  });

  fetchProducts();
}

// Initial load
fetchProducts();
