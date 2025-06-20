const API_BASE = 'http://localhost:5000/api/sales';

async function fetchAnalyticsData() {
  const res = await fetch(`${API_BASE}`);
  const sales = await res.json();

  // Earnings, daily sales, and product stats
  let totalEarnings = 0;
  const salesByDate = {};
  const productSales = {};

  sales.forEach(sale => {
    const date = new Date(sale.date).toLocaleDateString();
    const productName = sale.productId.name;
    const productPrice = sale.productId.price;
    const qty = sale.quantitySold;

    // Total earnings
    totalEarnings += qty * productPrice;

    // Group by date
    salesByDate[date] = (salesByDate[date] || 0) + qty;

    // Group by product
    productSales[productName] = (productSales[productName] || 0) + qty;
  });

  renderTotalEarnings(totalEarnings);
  renderDailySalesChart(salesByDate);
  renderTopProductsChart(productSales);
}

function renderTotalEarnings(amount) {
  const el = document.getElementById('totalEarnings');
  el.innerHTML = `<strong>Total Earnings:</strong> ₹${amount.toFixed(2)}`;
}

function renderDailySalesChart(data) {
  const ctx = document.getElementById('dailySalesChart').getContext('2d');
  const labels = Object.keys(data);
  const values = Object.values(data);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Units Sold',
        data: values,
        backgroundColor: '#1d4ed8'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderTopProductsChart(data) {
  const ctx = document.getElementById('topProductsChart').getContext('2d');
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const labels = sorted.map(item => item[0]);
  const values = sorted.map(item => item[1]);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: 'Top Products',
        data: values,
        backgroundColor: ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
      }]
    },
    options: {
      responsive: true
    }
  });
}

fetchAnalyticsData();
