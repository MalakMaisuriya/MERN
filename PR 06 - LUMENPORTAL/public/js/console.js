document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('[data-sidebar]');
  const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
  const backdrop = document.querySelector('[data-sidebar-backdrop]');

  const closeSidebar = () => {
    sidebar?.classList.remove('is-open');
    if (backdrop) {
      backdrop.hidden = true;
    }
  };

  const openSidebar = () => {
    sidebar?.classList.add('is-open');
    if (backdrop) {
      backdrop.hidden = false;
    }
  };

  sidebarToggle?.addEventListener('click', openSidebar);
  backdrop?.addEventListener('click', closeSidebar);

  document.querySelectorAll('[data-flash-dismiss]').forEach((banner) => {
    const closeButton = banner.querySelector('button');
    closeButton?.addEventListener('click', () => banner.remove());
    setTimeout(() => banner.remove(), 5000);
  });

  document.querySelectorAll('form.premium-form').forEach((form) => {
    form.addEventListener('submit', () => {
      const submitButton = form.querySelector('[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = 'Saving…';
      }
    });
  });

  const chartDataElement = document.getElementById('chart-data');
  if (chartDataElement && window.Chart) {
    const chartData = JSON.parse(chartDataElement.textContent);
    const chartDefaults = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#a1a1aa' } }
      },
      scales: {
        x: { ticks: { color: '#71717a' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#71717a' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    };

    const trendCanvas = document.getElementById('trendChart');
    if (trendCanvas) {
      new Chart(trendCanvas, {
        type: 'line',
        data: {
          labels: chartData.trendLabels,
          datasets: [{
            label: 'Publications',
            data: chartData.trendValues,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            fill: true,
            tension: 0.35
          }]
        },
        options: chartDefaults
      });
    }

    const statusCanvas = document.getElementById('statusChart');
    if (statusCanvas) {
      new Chart(statusCanvas, {
        type: 'doughnut',
        data: {
          labels: chartData.statusLabels,
          datasets: [{
            data: chartData.statusValues,
            backgroundColor: ['#71717a', '#22c55e', '#f59e0b']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa' } } }
        }
      });
    }

    const topicCanvas = document.getElementById('topicChart');
    if (topicCanvas) {
      new Chart(topicCanvas, {
        type: 'bar',
        data: {
          labels: chartData.topicLabels,
          datasets: [{
            label: 'Published',
            data: chartData.topicValues,
            backgroundColor: chartData.topicColors,
            borderRadius: 8
          }]
        },
        options: chartDefaults
      });
    }
  }
});
