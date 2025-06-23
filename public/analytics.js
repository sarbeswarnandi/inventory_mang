const startInput = document.getElementById('analyticsStart');
const endInput = document.getElementById('analyticsEnd');
const totalRevenueEl = document.getElementById('totalRevenue');
const totalProfitEl = document.getElementById('totalProfit');

const salesChartCtx = document.getElementById('dailySalesChart').getContext('2d');
const topProductsChartCtx = document.getElementById('topProductsChart').getContext('2d');

let salesChart, topProductsChart;

const formatDate = (d) => d.toISOString().split('T')[0];

const today = new Date();
const weekAgo = new Date();
weekAgo.setDate(today.getDate() - 6);

startInput.value = formatDate(weekAgo);
endInput.value = formatDate(today);

loadAnalytics(startInput.value, endInput.value);

[startInput, endInput].forEach(input => {
  input.addEventListener('change', () => {
    if (startInput.value && endInput.value) {
      loadAnalytics(startInput.value, endInput.value);
    }
  });
});

async function loadAnalytics(start, end) {
  try {
    const res = await fetch(`/api/sales/analytics?startDate=${start}&endDate=${end}`);
    const { totalRevenue, totalProfit, dailySales, topProducts } = await res.json();

    totalRevenueEl.textContent = `₹${totalRevenue.toFixed(2)}`;
    totalProfitEl.textContent = `₹${totalProfit.toFixed(2)}`;

    renderDailySalesChart(dailySales);
    renderTopProductsChart(topProducts);
  } catch (err) {
    console.error("Analytics error:", err);
    totalRevenueEl.textContent = totalProfitEl.textContent = "Error loading";
  }
}

function renderDailySalesChart(data) {
  const labels = data.map(d => d._id);
  const values = data.map(d => d.revenue);

  if (salesChart) salesChart.destroy();
  salesChart = new Chart(salesChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Daily Revenue (₹)',
        data: values,
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderTopProductsChart(data) {
  const labels = data.map(d => d.name);
  const values = data.map(d => d.quantity);

  if (topProductsChart) topProductsChart.destroy();
  topProductsChart = new Chart(topProductsChartCtx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Top Products',
        data: values,
        backgroundColor: ['#1d4ed8', '#3b82f6', '#6366f1', '#818cf8', '#a5b4fc']
      }]
    },
    options: {
      responsive: true
    }
  });
}
