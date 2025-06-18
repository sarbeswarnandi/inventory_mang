const API_BASE = 'http://localhost:5000/api/sales';
const salesList = document.getElementById('salesList');
const sortOrder = document.getElementById('sortOrder');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const totalEarningsEl = document.getElementById('totalEarnings');
const pageInfo = document.getElementById('pageInfo');

let currentPage = 1;
let totalPages = 1;

async function loadSales() {
  const query = new URLSearchParams({
    sort: sortOrder.value,
    startDate: startDate.value,
    endDate: endDate.value,
    page: currentPage,
    limit: 5
  });

  const res = await fetch(`${API_BASE}?${query}`);
  const data = await res.json();

  salesList.innerHTML = '';
  data.sales.forEach(sale => {
    const date = new Date(sale.date).toLocaleString();
    const li = document.createElement('li');
    li.className = 'sale-item';
    li.innerHTML = `
      <strong>${sale.productId.name}</strong> – Qty: ${sale.quantitySold} – ₹${sale.productId.price} 
      <br><small>${date}</small>
    `;
    salesList.appendChild(li);
  });

  totalEarningsEl.innerHTML = `<strong>Total Earnings:</strong> ₹${data.totalEarnings.toFixed(2)}`;
  totalPages = data.totalPages;
  pageInfo.textContent = `Page ${data.currentPage}`;
}

function changePage(offset) {
  if ((currentPage + offset) < 1 || (currentPage + offset) > totalPages) return;
  currentPage += offset;
  loadSales();
}

function downloadCSV() {
  const rows = [["Product Name", "Quantity Sold", "Price", "Total", "Date"]];
  const items = salesList.querySelectorAll('li');

  items.forEach(item => {
    const [info, dateLine] = item.innerText.split('\n');
    const [namePart, qtyPart, pricePart] = info.split('–').map(s => s.trim());
    const name = namePart;
    const qty = qtyPart.replace("Qty: ", "");
    const price = pricePart.replace("₹", "");
    const total = (Number(qty) * Number(price)).toFixed(2);
    const date = dateLine.trim();

    rows.push([name, qty, price, total, date]);
  });

  const csv = rows.map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

loadSales();
