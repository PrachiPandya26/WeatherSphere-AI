from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
import os
from app.weather_service import WeatherService
from app.ai_advisor import AIWeatherAdvisor

app = FastAPI(
    title="WeatherSphere AI",
    description="Next-Gen Weather Forecasting & Climate Intelligence Platform",
    version="1.0.0"
)

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

# Mount Static Files & Templates
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Render main application dashboard."""
    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/api/search")
async def search_locations(q: str = Query(..., min_length=2, description="Location search query")):
    """Endpoint to search locations worldwide with auto-complete suggestions."""
    try:
        results = await WeatherService.search_locations(q)
        return {"query": q, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/weather")
async def get_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    name: str = Query("Searched Location", description="City name")
):
    """Endpoint to fetch comprehensive weather forecast, AQI, and AI insights."""
    try:
        weather_data = await WeatherService.get_full_weather(lat, lon, location_name=name)
        ai_insights = AIWeatherAdvisor.generate_insights(weather_data)
        
        return {
            "status": "success",
            "weather": weather_data,
            "ai_insights": ai_insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather retrieval failed: {str(e)}")
