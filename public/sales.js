const API_BASE = 'http://localhost:5000/api/sales';
const salesList = document.getElementById('salesList');
const sortOrder = document.getElementById('sortOrder');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const totalEarningsEl = document.getElementById('totalEarnings');
const pageInfo = document.getElementById('pageInfo');
const saleForm = document.getElementById('saleForm');
const productSelect = document.getElementById('productSelect');

let currentPage = 1;
let totalPages = 1;

// Fetch and display sales
async function loadSales() {
  const query = new URLSearchParams({
    sort: sortOrder.value,
    startDate: startDate.value,
    endDate: endDate.value,
    page: currentPage,
    limit: 10
  });

  const res = await fetch(`${API_BASE}?${query}`);
  const data = await res.json();

  salesList.innerHTML = '';
  data.sales.forEach(sale => {
    const date = new Date(sale.date).toLocaleString();
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="product-row">
        <div class="product-info">
          <strong>${sale.productId.name}</strong> – Qty: ${sale.quantitySold} – ₹${sale.productId.price}
          <br><small>${date}</small>
        </div>
      </div>
    `;
    salesList.appendChild(li);
  });

  totalEarningsEl.innerHTML = `<strong>Total Earnings:</strong> ₹${data.totalEarnings.toFixed(2)}`;
  totalPages = data.totalPages;
  pageInfo.textContent = `Page ${data.currentPage}`;
}

function changePage(offset) {
  const nextPage = currentPage + offset;
  if (nextPage < 1 || nextPage > totalPages) return;
  currentPage = nextPage;
  loadSales();
}

function downloadCSV() {
  const rows = [["Product Name", "Quantity Sold", "Price", "Total", "Date"]];
  const items = salesList.querySelectorAll('li');

  items.forEach(item => {
    const [info, dateLine] = item.innerText.split('\n');
    const [name, qtyPart, pricePart] = info.split('–').map(s => s.trim());
    const qty = qtyPart.replace("Qty: ", "");
    const price = pricePart.replace("₹", "");
    const total = (Number(qty) * Number(price)).toFixed(2);
    const date = dateLine.trim();

    rows.push([name, qty, price, total, date]);
  });

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Load product dropdown
async function loadProducts() {
  const res = await fetch('http://localhost:5000/api/products');
  const products = await res.json();

  productSelect.innerHTML = '<option value="">Select Product</option>';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p._id;
    opt.textContent = `${p.name} (₹${p.price})`;
    productSelect.appendChild(opt);
  });
}

function applyFilters() {
  currentPage = 1;
  loadSales();
}

saleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const productId = productSelect.value;
  const quantitySold = document.getElementById('saleQuantity').value;

  if (!productId || quantitySold <= 0) {
    alert('Please select a valid product and quantity.');
    return;
  }

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantitySold })
  });

  if (res.ok) {
    alert('Sale logged!');
    saleForm.reset();
    loadSales();
  } else {
    const err = await res.json();
    alert(`Error: ${err.message}`);
  }
});

// Init
loadProducts();
loadSales();
