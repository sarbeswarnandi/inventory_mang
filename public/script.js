const API_BASE = 'http://localhost:5000/api/products';
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');

async function fetchProducts() {
  try {
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
            <button onclick="editProduct('${p._id}', '${p.name}', ${p.quantity}, ${p.price})">✏️</button>
            <button onclick="deleteProduct('${p._id}')">❌</button>
          </div>
        </div>
      `;
      productList.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const quantity = document.getElementById('quantity').value;
  const price = document.getElementById('price').value;

  try {
    await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, quantity, price })
    });
    productForm.reset();
    fetchProducts();
  } catch (err) {
    alert('Error adding product.');
  }
});

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

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  fetchProducts();
}

fetchProducts();
