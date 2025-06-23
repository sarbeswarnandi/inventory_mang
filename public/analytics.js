const startInput = document.getElementById('analyticsStart');
const endInput = document.getElementById('analyticsEnd');
const totalEarningsEl = document.getElementById('totalEarnings');

const salesChartCtx = document.getElementById('dailySalesChart').getContext('2d');
const topProductsChartCtx = document.getElementById('topProductsChart').getContext('2d');

let salesChart, topProductsChart;

// Helper: Format date to YYYY-MM-DD
const formatDate = (d) => d.toISOString().split('T')[0];

// Set default date range (last 7 days)
const today = new Date();
const lastWeek = new Date();
lastWeek.setDate(today.getDate() - 6);

startInput.value = formatDate(lastWeek);
endInput.value = formatDate(today);

// Load analytics initially
loadAnalytics(startInput.value, endInput.value);

// Load on date input change
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
    if (!res.ok) throw new Error("Failed to fetch analytics");

    const { totalEarnings, dailySales, topProducts } = await res.json();

    totalEarningsEl.textContent = `₹${totalEarnings.toFixed(2)}`;

    renderDailySalesChart(dailySales);
    renderTopProductsChart(topProducts);
  } catch (err) {
    console.error("Error loading analytics:", err);
    totalEarningsEl.textContent = "Failed to load";
  }
}

function renderDailySalesChart(data) {
  const labels = data.map(d => d._id);
  const values = data.map(d => d.quantity);

  if (salesChart) salesChart.destroy();
  salesChart = new Chart(salesChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Units Sold',
        data: values,
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Units'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
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
        backgroundColor: [
          '#1d4ed8', '#3b82f6', '#6366f1', '#818cf8', '#a5b4fc'
        ],
        borderColor: '#fff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
