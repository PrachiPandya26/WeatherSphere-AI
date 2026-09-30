class WeatherApp {
  constructor() {
    this.currentUnit = 'C'; // 'C' or 'F'
    this.currentWeatherData = null;
    this.debounceTimer = null;
    this.map = null;
    this.marker = null;

    this.initElements();
    this.initEvents();
    this.initMap();
    
    // Default location (e.g. London or user IP)
    this.fetchWeather(51.5074, -0.1278, "London");
  }

  initElements() {
    this.searchInput = document.getElementById('search-input');
    this.suggestionsBox = document.getElementById('search-suggestions');
    this.locationBtn = document.getElementById('location-btn');
    this.unitToggleBtn = document.getElementById('unit-toggle-btn');
    this.loader = document.getElementById('loader-overlay');
  }

  initEvents() {
    // Search input typing with debounce
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      const query = e.target.value.trim();
      if (query.length < 2) {
        this.suggestionsBox.style.display = 'none';
        return;
      }
      this.debounceTimer = setTimeout(() => this.searchLocations(query), 300);
    });

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && !this.suggestionsBox.contains(e.target)) {
        this.suggestionsBox.style.display = 'none';
      }
    });

    // Geolocation button
    this.locationBtn.addEventListener('click', () => this.useCurrentLocation());

    // Unit toggle button (°C / °F)
    this.unitToggleBtn.addEventListener('click', () => {
      this.currentUnit = this.currentUnit === 'C' ? 'F' : 'C';
      this.unitToggleBtn.textContent = `°${this.currentUnit}`;
      if (this.currentWeatherData) {
        this.renderUI(this.currentWeatherData);
      }
    });
  }

  initMap() {
    // Initialize Leaflet map
    this.map = L.map('weather-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([51.5074, -0.1278], 10);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(this.map);
  }

  updateMap(lat, lon, cityName) {
    this.map.setView([lat, lon], 10);
    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else {
      this.marker = L.marker([lat, lon]).addTo(this.map);
    }
    this.marker.bindPopup(`<b>${cityName}</b>`).openPopup();
  }

  async searchLocations(query) {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        this.renderSuggestions(data.results);
      } else {
        this.suggestionsBox.style.display = 'none';
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  }

  renderSuggestions(results) {
    this.suggestionsBox.innerHTML = '';
    results.forEach(loc => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.innerHTML = `
        <div>
          <strong>${loc.name}</strong>
          <span style="font-size:12px; color:#94a3b8; margin-left:6px;">${loc.admin1 ? loc.admin1 + ',' : ''} ${loc.country}</span>
        </div>
        <i class="fas fa-arrow-right" style="color:var(--primary-accent); font-size:12px;"></i>
      `;
      div.addEventListener('click', () => {
        this.searchInput.value = loc.name;
        this.suggestionsBox.style.display = 'none';
        this.fetchWeather(loc.latitude, loc.longitude, loc.display_name);
      });
      this.suggestionsBox.appendChild(div);
    });
    this.suggestionsBox.style.display = 'block';
  }

  useCurrentLocation() {
    if (navigator.geolocation) {
      this.showLoader(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
        },
        (err) => {
          this.showLoader(false);
          alert("Unable to retrieve your location. Please type a city name in search.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }

  async fetchWeather(lat, lon, cityName) {
    this.showLoader(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      
      if (data.status === 'success') {
        this.currentWeatherData = data;
        this.renderUI(data);
        this.updateMap(lat, lon, cityName);
      }
    } catch (err) {
      console.error("Weather fetch failed:", err);
      alert("Failed to fetch weather data. Please try again.");
    } finally {
      this.showLoader(false);
    }
  }

  convertTemp(celsius) {
    if (this.currentUnit === 'F') {
      return Math.round((celsius * 9/5) + 32);
    }
    return Math.round(celsius);
  }

  getIconClass(icon) {
    const iconMap = {
      'sun': 'fa-sun',
      'cloud-sun': 'fa-cloud-sun',
      'cloud': 'fa-cloud',
      'smog': 'fa-smog',
      'cloud-rain': 'fa-cloud-rain',
      'cloud-showers-heavy': 'fa-cloud-showers-heavy',
      'snowflake': 'fa-snowflake',
      'cloud-sun-rain': 'fa-cloud-sun-rain',
      'bolt': 'fa-bolt'
    };
    return iconMap[icon] || 'fa-cloud-sun';
  }

  renderUI(data) {
    const w = data.weather;
    const ai = data.ai_insights;
    const cur = w.current;

    // Trigger Canvas background effect
    if (window.weatherCanvas) {
      window.weatherCanvas.setWeather(cur.category, cur.is_day);
    }

    // Hero Card
    document.getElementById('city-name').textContent = w.location.name;
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    document.getElementById('weather-desc').textContent = cur.description;
    document.getElementById('main-temp').textContent = `${this.convertTemp(cur.temperature)}°`;
    document.getElementById('feels-like-temp').textContent = `${this.convertTemp(cur.feels_like)}°${this.currentUnit}`;
    
    const heroIcon = document.getElementById('hero-weather-icon');
    heroIcon.className = `fas ${this.getIconClass(cur.icon)} weather-icon-giant`;

    // Quick Stats
    document.getElementById('stat-wind').textContent = `${cur.wind_speed} km/h`;
    document.getElementById('stat-humidity').textContent = `${cur.humidity}%`;
    document.getElementById('stat-pressure').textContent = `${cur.pressure} hPa`;
    document.getElementById('stat-precip').textContent = `${cur.precipitation} mm`;

    // AI Advisor Section
    document.getElementById('ai-summary-text').textContent = ai.summary;
    document.getElementById('ai-clothing-text').textContent = ai.clothing;
    document.getElementById('activity-score-num').textContent = `${ai.activity_score}/100`;

    const activitiesList = document.getElementById('ai-activities-list');
    activitiesList.innerHTML = ai.recommended_activities.map(act => `<li>${act}</li>`).join('');

    const healthList = document.getElementById('ai-health-list');
    healthList.innerHTML = ai.health_advisories.map(adv => `<p>${adv}</p>`).join('');

    // Hourly Forecast Scroll
    const hourlyContainer = document.getElementById('hourly-scroll-container');
    hourlyContainer.innerHTML = '';
    w.hourly.forEach(h => {
      const item = document.createElement('div');
      item.className = 'hourly-item';
      item.innerHTML = `
        <div class="hourly-time">${h.time}</div>
        <i class="fas ${this.getIconClass(h.icon)} hourly-icon"></i>
        <div class="hourly-temp">${this.convertTemp(h.temperature)}°</div>
      `;
      hourlyContainer.appendChild(item);
    });

    // Hourly Chart.js
    if (window.weatherCharts) {
      // Map temperatures according to current unit
      const hourlyFormatted = w.hourly.map(h => ({
        ...h,
        temperature: this.convertTemp(h.temperature)
      }));
      window.weatherCharts.renderHourlyChart('hourly-chart-canvas', hourlyFormatted);
    }

    // 7-Day Forecast List
    const dailyContainer = document.getElementById('daily-forecast-container');
    dailyContainer.innerHTML = '';
    w.daily.forEach(d => {
      const dayName = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });
      const item = document.createElement('div');
      item.className = 'daily-item';
      item.innerHTML = `
        <div class="daily-day">${dayName}</div>
        <div class="daily-icon-box">
          <i class="fas ${this.getIconClass(d.icon)}"></i>
          <span class="daily-desc">${d.description}</span>
        </div>
        <div class="daily-temp-range">
          <span class="temp-max">${this.convertTemp(d.temp_max)}°</span>
          <span class="temp-min">${this.convertTemp(d.temp_min)}°</span>
        </div>
      `;
      dailyContainer.appendChild(item);
    });

    // Air Quality Section
    const aqi = w.aqi;
    document.getElementById('aqi-val').textContent = aqi.us_aqi;
    document.getElementById('aqi-val').style.color = aqi.color;
    document.getElementById('aqi-status').textContent = aqi.level;
    document.getElementById('aqi-status').style.color = aqi.color;
    document.getElementById('aqi-pm25').textContent = `${aqi.pm2_5} µg/m³`;
    document.getElementById('aqi-pm10').textContent = `${aqi.pm10} µg/m³`;
  }

  showLoader(show) {
    if (show) {
      this.loader.classList.remove('hidden');
    } else {
      this.loader.classList.add('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.weatherApp = new WeatherApp();
});
