const API_BASE = 'http://localhost:5000/api/sales';

async function fetchAnalyticsData() {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    const { totalEarnings, dailySales, topProducts } = await res.json();

    // Prepare chart data
    const salesByDate = Object.fromEntries(
      dailySales.map(d => [d._id, d.quantity])
    );

    const productSales = Object.fromEntries(
      topProducts.map(p => [p.name, p.quantity])
    );

    // Render
    renderTotalEarnings(totalEarnings);
    renderDailySalesChart(salesByDate);
    renderTopProductsChart(productSales);
  } catch (err) {
    console.error("Error loading analytics:", err);
    alert("Failed to load analytics data.");
  }
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
      },
      scales: {
        y: {
          beginAtZero: true
        }
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

// 🚀 Start fetching
fetchAnalyticsData();
