import httpx
from typing import Dict, Any, List, Optional

# WMO Weather interpretation codes map
WMO_CODE_MAP = {
    0: {"description": "Clear Sky", "icon": "sun", "category": "clear"},
    1: {"description": "Mainly Clear", "icon": "cloud-sun", "category": "clear"},
    2: {"description": "Partly Cloudy", "icon": "cloud-sun", "category": "cloudy"},
    3: {"description": "Overcast", "icon": "cloud", "category": "cloudy"},
    45: {"description": "Foggy", "icon": "smog", "category": "fog"},
    48: {"description": "Depositing Rime Fog", "icon": "smog", "category": "fog"},
    51: {"description": "Light Drizzle", "icon": "cloud-rain", "category": "rain"},
    53: {"description": "Moderate Drizzle", "icon": "cloud-rain", "category": "rain"},
    55: {"description": "Dense Drizzle", "icon": "cloud-showers-heavy", "category": "rain"},
    56: {"description": "Light Freezing Drizzle", "icon": "snowflake", "category": "snow"},
    57: {"description": "Dense Freezing Drizzle", "icon": "snowflake", "category": "snow"},
    61: {"description": "Slight Rain", "icon": "cloud-rain", "category": "rain"},
    63: {"description": "Moderate Rain", "icon": "cloud-rain", "category": "rain"},
    65: {"description": "Heavy Rain", "icon": "cloud-showers-heavy", "category": "rain"},
    66: {"description": "Light Freezing Rain", "icon": "snowflake", "category": "snow"},
    67: {"description": "Heavy Freezing Rain", "icon": "snowflake", "category": "snow"},
    71: {"description": "Slight Snow Fall", "icon": "snowflake", "category": "snow"},
    73: {"description": "Moderate Snow Fall", "icon": "snowflake", "category": "snow"},
    75: {"description": "Heavy Snow Fall", "icon": "snowflake", "category": "snow"},
    77: {"description": "Snow Grains", "icon": "snowflake", "category": "snow"},
    80: {"description": "Slight Rain Showers", "icon": "cloud-sun-rain", "category": "rain"},
    81: {"description": "Moderate Rain Showers", "icon": "cloud-sun-rain", "category": "rain"},
    82: {"description": "Violent Rain Showers", "icon": "cloud-showers-heavy", "category": "rain"},
    85: {"description": "Slight Snow Showers", "icon": "snowflake", "category": "snow"},
    86: {"description": "Heavy Snow Showers", "icon": "snowflake", "category": "snow"},
    95: {"description": "Thunderstorm", "icon": "bolt", "category": "thunderstorm"},
    96: {"description": "Thunderstorm with Slight Hail", "icon": "bolt", "category": "thunderstorm"},
    99: {"description": "Thunderstorm with Heavy Hail", "icon": "bolt", "category": "thunderstorm"}
}

def get_weather_info(code: int) -> Dict[str, str]:
    return WMO_CODE_MAP.get(code, {"description": "Unknown Weather", "icon": "question", "category": "clear"})

class WeatherService:
    @staticmethod
    async def search_locations(query: str) -> List[Dict[str, Any]]:
        """Search for locations globally using Open-Meteo Geocoding API."""
        if not query or len(query.strip()) < 2:
            return []
        
        url = f"httpsgeocoding-api.open-meteo.com/v1/search"
        params = {
            "name": query.strip(),
            "count": 6,
            "language": "en",
            "format": "json"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://geocoding-api.open-meteo.com/v1/search", params=params)
            if response.status_code == 200:
                data = response.json()
                results = []
                for item in data.get("results", []):
                    results.append({
                        "name": item.get("name"),
                        "latitude": item.get("latitude"),
                        "longitude": item.get("longitude"),
                        "country": item.get("country", ""),
                        "country_code": item.get("country_code", ""),
                        "admin1": item.get("admin1", ""),
                        "elevation": item.get("elevation", 0),
                        "display_name": f"{item.get('name')}, {item.get('admin1', '')} {item.get('country', '')}".strip(" ,")
                    })
                return results
            return []

    @staticmethod
    async def get_full_weather(lat: float, lon: float, location_name: str = "Target Location") -> Dict[str, Any]:
        """Fetch current weather, 24-hour hourly forecast, 7-day daily forecast, and AQI."""
        weather_url = "https://api.open-meteo.com/v1/forecast"
        weather_params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
            "hourly": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
            "timezone": "auto"
        }
        
        aqi_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
        aqi_params = {
            "latitude": lat,
            "longitude": lon,
            "current": "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
            "timezone": "auto"
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            # Fetch weather & AQI concurrently
            weather_res, aqi_res = await client.get(weather_url, params=weather_params), await client.get(aqi_url, params=aqi_params)
            
            if weather_res.status_code != 200:
                raise Exception(f"Failed to fetch weather data: {weather_res.text}")
                
            weather_data = weather_res.json()
            aqi_data = aqi_res.json() if aqi_res.status_code == 200 else {}
            
            current_raw = weather_data.get("current", {})
            w_code = current_raw.get("weather_code", 0)
            w_info = get_weather_info(w_code)
            
            # Format current weather
            current = {
                "temperature": round(current_raw.get("temperature_2m", 0), 1),
                "feels_like": round(current_raw.get("apparent_temperature", 0), 1),
                "humidity": current_raw.get("relative_humidity_2m", 0),
                "precipitation": current_raw.get("precipitation", 0),
                "pressure": round(current_raw.get("pressure_msl", 0), 1),
                "wind_speed": round(current_raw.get("wind_speed_10m", 0), 1),
                "wind_direction": current_raw.get("wind_direction_10m", 0),
                "cloud_cover": current_raw.get("cloud_cover", 0),
                "is_day": current_raw.get("is_day", 1),
                "weather_code": w_code,
                "description": w_info["description"],
                "icon": w_info["icon"],
                "category": w_info["category"]
            }
            
            # Format hourly (next 24 hours)
            hourly_raw = weather_data.get("hourly", {})
            hourly_list = []
            times = hourly_raw.get("time", [])[:24]
            temps = hourly_raw.get("temperature_2m", [])[:24]
            precip_probs = hourly_raw.get("precipitation_probability", [])[:24]
            weather_codes = hourly_raw.get("weather_code", [])[:24]
            uv_indices = hourly_raw.get("uv_index", [])[:24]
            
            for i in range(len(times)):
                code_i = weather_codes[i] if i < len(weather_codes) else 0
                hourly_list.append({
                    "time": times[i].split("T")[1][:5] if "T" in times[i] else times[i],
                    "temperature": round(temps[i], 1) if i < len(temps) else 0,
                    "precip_prob": precip_probs[i] if i < len(precip_probs) else 0,
                    "uv_index": uv_indices[i] if i < len(uv_indices) else 0,
                    "weather_code": code_i,
                    "icon": get_weather_info(code_i)["icon"]
                })
                
            # Format daily (7 days)
            daily_raw = weather_data.get("daily", {})
            daily_list = []
            d_dates = daily_raw.get("time", [])
            d_codes = daily_raw.get("weather_code", [])
            d_max_temps = daily_raw.get("temperature_2m_max", [])
            d_min_temps = daily_raw.get("temperature_2m_min", [])
            d_precip_probs = daily_raw.get("precipitation_probability_max", [])
            d_uv_max = daily_raw.get("uv_index_max", [])
            d_sunrises = daily_raw.get("sunrise", [])
            d_sunsets = daily_raw.get("sunset", [])
            
            for i in range(min(7, len(d_dates))):
                code_d = d_codes[i] if i < len(d_codes) else 0
                info_d = get_weather_info(code_d)
                daily_list.append({
                    "date": d_dates[i],
                    "temp_max": round(d_max_temps[i], 1) if i < len(d_max_temps) else 0,
                    "temp_min": round(d_min_temps[i], 1) if i < len(d_min_temps) else 0,
                    "weather_code": code_d,
                    "description": info_d["description"],
                    "icon": info_d["icon"],
                    "precip_prob": d_precip_probs[i] if i < len(d_precip_probs) else 0,
                    "uv_max": d_uv_max[i] if i < len(d_uv_max) else 0,
                    "sunrise": d_sunrises[i].split("T")[1][:5] if i < len(d_sunrises) and "T" in d_sunrises[i] else "",
                    "sunset": d_sunsets[i].split("T")[1][:5] if i < len(d_sunsets) and "T" in d_sunsets[i] else ""
                })

            # Format Air Quality (AQI)
            current_aqi_raw = aqi_data.get("current", {})
            us_aqi_val = current_aqi_raw.get("us_aqi", 0)
            
            if us_aqi_val <= 50:
                aqi_level = "Good"
                aqi_color = "#10B981"
            elif us_aqi_val <= 100:
                aqi_level = "Moderate"
                aqi_color = "#F59E0B"
            elif us_aqi_val <= 150:
                aqi_level = "Unhealthy for Sensitive Groups"
                aqi_color = "#F97316"
            elif us_aqi_val <= 200:
                aqi_level = "Unhealthy"
                aqi_color = "#EF4444"
            else:
                aqi_level = "Hazardous"
                aqi_color = "#8B5CF6"
                
            aqi_info = {
                "us_aqi": us_aqi_val,
                "level": aqi_level,
                "color": aqi_color,
                "pm2_5": current_aqi_raw.get("pm2_5", 0),
                "pm10": current_aqi_raw.get("pm10", 0),
                "no2": current_aqi_raw.get("nitrogen_dioxide", 0),
                "o3": current_aqi_raw.get("ozone", 0)
            }
            
            return {
                "location": {
                    "name": location_name,
                    "latitude": lat,
                    "longitude": lon,
                    "timezone": weather_data.get("timezone", "UTC")
                },
                "current": current,
                "hourly": hourly_list,
                "daily": daily_list,
                "aqi": aqi_info
            }
