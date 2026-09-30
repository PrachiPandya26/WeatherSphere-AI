# ⚡ WeatherSphere AI - Intelligent Weather & Climate Forecasting Platform

[![Live App](https://img.shields.io/badge/Live_App-Open_WeatherSphere_AI-00f2fe?style=for-the-badge&logo=render)](https://weathersphere-ai.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/PrachiPandya26/WeatherSphere-AI)

🚀 **Live Deployment URL**: **[https://weathersphere-ai.onrender.com](https://weathersphere-ai.onrender.com)**  
*(Alternative Vercel URL: [https://weathersphere-ai.vercel.app](https://weathersphere-ai.vercel.app))*

A fullstack Python & FastAPI weather web application built with a modern Glassmorphism dark UI, live dynamic atmospheric canvas background animations, interactive Chart.js trend graphs, Leaflet geographic maps, and a smart AI Weather Advisor engine.

Repository: **[https://github.com/PrachiPandya26/WeatherSphere-AI](https://github.com/PrachiPandya26/WeatherSphere-AI)**

---

## ✨ Key Features

1. **AI Weather Advisor**:
   - Smart Python rule engine generating intelligent outfit & clothing recommendations.
   - Outdoor activity suitability score (0-100 rating with activity ideas).
   - Environmental & health risk alerts (High UV warnings, Air Quality warnings, extreme temperature alerts).

2. **Live Canvas Atmosphere Particle Effects**:
   - Dynamic HTML5 Canvas background that morphs in real-time based on current weather conditions (Falling raindrops with splashes, floating snow crystals, thunderstorm lightning flashes, glowing sun glare, cloud fog mist, starry night cosmos).

3. **Hyper-Accurate Open-Meteo Integration (No API Key Required)**:
   - Global Weather Forecasts & Current Metrics (Temperature, Feels like, Humidity, Wind speed & direction, Pressure, Precipitation).
   - 24-Hour Hourly Trend Chart (Chart.js temperature curve & rain probability).
   - 7-Day Daily Forecast.
   - US Air Quality Index (AQI) with PM2.5 and PM10 breakdown.

4. **Modern Responsive Glassmorphism UI**:
   - Sleek dark theme with HSL glowing accents and frosted glass cards.
   - Global Location Search with instant 300ms debounced auto-complete suggestions.
   - Geolocation auto-detection ("Use My Current Location").
   - Temperature Unit Switcher (°C / °F).
   - Dark mode Leaflet Interactive Map centered on searched locations.

---

## 🌐 Deploy Live for Free (1-Click Hosting)

### Option A: Deploy on Render.com (Recommended Free Hosting)
1. Sign up/Log in to **[Render.com](https://render.com)**.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `PrachiPandya26/WeatherSphere-AI`.
4. Render automatically detects `render.yaml` and deploys your live app at `https://weathersphere-ai.onrender.com`!

### Option B: Deploy on Vercel
1. Go to **[Vercel.com](https://vercel.com)** and import `PrachiPandya26/WeatherSphere-AI`.
2. Vercel automatically detects `vercel.json` and deploys your FastAPI web app in seconds at `https://weathersphere-ai.vercel.app`.

---

## 💻 Local Development Setup

### 1. Install Dependencies
Make sure you have Python 3.9+ installed:

```bash
pip install -r requirements.txt
```

### 2. Run the Server
Launch the local server:

```bash
python run.py
```
Or:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Open in Browser
Visit **[http://localhost:8000](http://localhost:8000)**

---

## 📁 Project Structure

```
WeatherSphere_AI/
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI REST API endpoints & route handlers
│   ├── weather_service.py        # Open-Meteo API wrapper (Weather, AQI, Geocoding)
│   ├── ai_advisor.py             # Intelligent AI advice & activity scoring engine
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css         # Glassmorphism design system & responsive layout
│   │   ├── js/
│   │   │   ├── app.js            # Main controller, search debounce, map & UI state
│   │   │   ├── canvas_weather.js # Dynamic WebGL/Canvas live atmospheric animations
│   │   │   └── charts.js         # Chart.js temperature/precipitation graph renderer
│   └── templates/
│       └── index.html            # Dashboard layout HTML template
├── requirements.txt              # Python requirements
├── Procfile                      # Hosting start command
├── render.yaml                   # Render deployment config
├── vercel.json                   # Vercel deployment config
├── run.py                        # Local runner script
└── README.md                     # Documentation
```
