const API_BASE = 'http://localhost:5000/api/sales';
const salesList = document.getElementById('salesList');
const sortOrder = document.getElementById('sortOrder');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const totalEarningsEl = document.getElementById('totalEarnings');
const pageInfo = document.getElementById('pageInfo');
const saleForm = document.getElementById('saleForm');
const productSelect = document.getElementById('productSelect');
const saleQuantity = document.getElementById('saleQuantity');

let currentPage = 1;
let totalPages = 1;

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
  const next = currentPage + offset;
  if (next < 1 || next > totalPages) return;
  currentPage = next;
  loadSales();
}

function downloadCSV() {
  const rows = [["Product Name", "Qty", "Price", "Total", "Date"]];
  salesList.querySelectorAll('li').forEach(item => {
    const [line, date] = item.innerText.split('\n');
    const [name, qty, price] = line.split('–').map(s => s.trim());
    const total = (Number(qty.replace("Qty: ", "")) * Number(price.replace("₹", ""))).toFixed(2);
    rows.push([name, qty.replace("Qty: ", ""), price.replace("₹", ""), total, date.trim()]);
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

function applyFilters() {
  currentPage = 1;
  loadSales();
}

saleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const productId = productSelect.value;
  const quantitySold = saleQuantity.value;

  if (!productId || quantitySold <= 0) {
    return alert('Invalid input');
  }

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantitySold })
  });

  if (res.ok) {
    alert('Sale recorded!');
    saleForm.reset();
    loadSales();
  } else {
    const err = await res.json();
    alert(`Error: ${err.message}`);
  }
});

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

loadProducts();
loadSales();
