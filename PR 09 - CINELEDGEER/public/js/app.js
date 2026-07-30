document.addEventListener('DOMContentLoaded', () => {
  // Mobile Sidebar Toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Dashboard Chart.js Initialization
  const chartEl = document.getElementById('revenueChart');
  if (chartEl && window.Chart) {
    const labels = JSON.parse(chartEl.dataset.labels || '[]');
    const values = JSON.parse(chartEl.dataset.values || '[]');

    new Chart(chartEl, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue (₹)',
          data: values,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: function(value) {
                return '₹' + value;
              }
            }
          }
        }
      }
    });
  }

  // Auto Dismiss Toast Flash Alerts after 5 seconds
  const flashAlert = document.getElementById('flashAlert');
  if (flashAlert) {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(flashAlert);
      bsAlert.close();
    }, 5000);
  }

  // Image Upload Preview
  const posterInput = document.getElementById('posterInput');
  const posterPreview = document.getElementById('posterPreview');
  if (posterInput && posterPreview) {
    posterInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          posterPreview.src = event.target.result;
          posterPreview.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
      }
    });
  }
});
