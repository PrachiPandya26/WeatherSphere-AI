class WeatherCharts {
  constructor() {
    this.tempChart = null;
  }

  renderHourlyChart(canvasId, hourlyData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = hourlyData.map(d => d.time);
    const temps = hourlyData.map(d => d.temperature);
    const precip = hourlyData.map(d => d.precip_prob);

    if (this.tempChart) {
      this.tempChart.destroy();
    }

    // Chart Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

    this.tempChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temps,
            borderColor: '#00f2fe',
            borderWidth: 3,
            fill: true,
            backgroundColor: gradient,
            tension: 0.4,
            pointBackgroundColor: '#00f2fe',
            pointHoverRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Rain Chance (%)',
            data: precip,
            borderColor: 'rgba(147, 197, 253, 0.6)',
            borderWidth: 2,
            borderDash: [4, 4],
            fill: false,
            tension: 0.3,
            pointRadius: 0,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#00f2fe',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', maxTicksLimit: 12 }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#00f2fe' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            max: 100,
            grid: { drawOnChartArea: false },
            ticks: { color: '#93c5fd' }
          }
        }
      }
    });
  }
}

window.weatherCharts = new WeatherCharts();
