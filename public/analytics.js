const API_BASE = 'http://localhost:5000/api/sales';
const totalEl = document.getElementById('totalEarnings');
const startInput = document.getElementById('analyticsStart');
const endInput = document.getElementById('analyticsEnd');

let salesChart, topChart;

// 🔁 Fetch analytics from server with optional date range
async function fetchAnalyticsData() {
  const params = new URLSearchParams();

  const start = startInput?.value;
  const end = endInput?.value;

  if (start) params.append('startDate', start);
  if (end) params.append('endDate', end);

  try {
    const res = await fetch(`${API_BASE}/analytics?${params}`);
    const { totalEarnings, dailySales, topProducts } = await res.json();

    // Process chart data
    const salesByDate = Object.fromEntries(dailySales.map(d => [d._id, d.quantity]));
    const productSales = Object.fromEntries(topProducts.map(p => [p.name, p.quantity]));

    renderTotalEarnings(totalEarnings);
    renderDailySalesChart(salesByDate);
    renderTopProductsChart(productSales);
  } catch (err) {
    console.error("Analytics error:", err);
    alert("Failed to load analytics");
  }
}

// 💰 Render total earnings
function renderTotalEarnings(amount) {
  totalEl.innerHTML = `<strong>Total Earnings:</strong> ₹${amount.toFixed(2)}`;
}

// 📊 Daily Sales Chart
function renderDailySalesChart(data) {
  const ctx = document.getElementById('dailySalesChart').getContext('2d');
  const labels = Object.keys(data);
  const values = Object.values(data);

  if (salesChart) salesChart.destroy();

  salesChart = new Chart(ctx, {
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
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// 🥇 Top Products Chart
function renderTopProductsChart(data) {
  const ctx = document.getElementById('topProductsChart').getContext('2d');
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const labels = sorted.map(item => item[0]);
  const values = sorted.map(item => item[1]);

  if (topChart) topChart.destroy();

  topChart = new Chart(ctx, {
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

// 🔄 Date filter change
function applyAnalyticsFilter() {
  fetchAnalyticsData();
}

// 📅 Auto fetch on load
document.addEventListener('DOMContentLoaded', () => {
  if (startInput && endInput) {
    startInput.addEventListener('change', applyAnalyticsFilter);
    endInput.addEventListener('change', applyAnalyticsFilter);
  }
  fetchAnalyticsData();
});
