const API_BASE = '/api/sales';
const saleForm = document.getElementById('saleForm');
const productSearch = document.getElementById('productSearch');
const datalist = document.getElementById('productListDatalist');
const productSelect = document.getElementById('productSelect');
const saleQuantity = document.getElementById('saleQuantity');
const sortOrder = document.getElementById('sortOrder');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const totalEarningsEl = document.getElementById('totalEarnings');
const salesList = document.getElementById('salesList');
const pageInfo = document.getElementById('pageInfo');

let products = [], currentPage = 1, totalPages = 1;

async function loadProducts() {
  const res = await fetch('/api/products');
  products = await res.json();
  datalist.innerHTML = products.map(p =>
    `<option data-id="${p._id}" value="${p.name}"></option>`
  ).join('');
}

productSearch.addEventListener('input', () => {
  const opt = [...datalist.options].find(o => o.value === productSearch.value);
  productSelect.value = opt ? opt.dataset.id : '';
});

saleForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!productSelect.value) return alert('Select a valid product');
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      productId: productSelect.value,
      quantitySold: saleQuantity.value
    })
  });
  const data = await res.json();
  if (!res.ok) return alert(data.message);
  saleForm.reset();
  loadSales();
});

async function loadSales() {
  const params = new URLSearchParams({
    sort: sortOrder.value,
    startDate: startDate.value,
    endDate: endDate.value,
    page: currentPage,
    limit: 10
  });
  const res = await fetch(`${API_BASE}?${params}`);
  const { sales, totalPages: tp, currentPage: cp, totalEarnings } = await res.json();
  totalPages = tp; currentPage = cp;
  totalEarningsEl.innerHTML = `<strong>Total Earnings:</strong> ₹${totalEarnings.toFixed(2)}`;
  salesList.innerHTML = sales.map(s => {
    const date = new Date(s.date).toLocaleString();
    return `
      <li>
        <div><strong>${s.productId.name}</strong> – Qty: ${s.quantitySold} – ₹${s.productId.price}</div>
        <div><small>${date}</small></div>
      </li>`;
  }).join('');
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function changePage(offset) {
  const np = currentPage + offset;
  if (np < 1 || np > totalPages) return;
  currentPage = np;
  loadSales();
}

function applyFilters() {
  currentPage = 1;
  loadSales();
}

function downloadCSV() {
  const rows = [["Product Name", "Qty", "Price", "Total", "Date"]];
  document.querySelectorAll('#salesList li').forEach(item => {
    const lines = item.innerText.split('\n');
    const [info, date] = lines;
    const [name, qtyPart, pricePart] = info.split('–').map(s => s.trim());
    const qty = qtyPart.replace("Qty: ", "");
    const price = pricePart.replace("₹", "");
    const total = (qty * price).toFixed(2);
    rows.push([name, qty, price, total, date]);
  });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sales_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

loadProducts();
loadSales();
