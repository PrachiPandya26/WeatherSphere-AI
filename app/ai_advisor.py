from typing import Dict, Any, List

class AIWeatherAdvisor:
    """Intelligent Python Rule Engine for generating contextual weather insights, clothing advice, and outdoor activity scores."""

    @staticmethod
    def generate_insights(weather_data: Dict[str, Any]) -> Dict[str, Any]:
        current = weather_data.get("current", {})
        daily = weather_data.get("daily", [{}])[0]
        aqi = weather_data.get("aqi", {})
        
        temp = current.get("temperature", 20)
        feels_like = current.get("feels_like", 20)
        humidity = current.get("humidity", 50)
        wind_speed = current.get("wind_speed", 10)
        precip = current.get("precipitation", 0)
        category = current.get("category", "clear")
        is_day = current.get("is_day", 1)
        uv_max = daily.get("uv_max", 3)
        aqi_val = aqi.get("us_aqi", 30)
        
        # 1. Clothing Recommendation
        clothing = []
        if temp < 5:
            clothing.append("Heavy winter coat, thermal layers, scarf, and insulated gloves are strongly advised.")
        elif 5 <= temp < 15:
            clothing.append("A cozy jacket, sweater, or hoodie paired with full pants is recommended.")
        elif 15 <= temp < 25:
            clothing.append("Comfortable casual attire: jeans with a light long-sleeve shirt or t-shirt.")
        else:
            clothing.append("Breathable shorts, lightweight cotton t-shirt, and open footwear.")
            
        if category in ["rain", "thunderstorm"] or precip > 0:
            clothing.append("Don't forget a sturdy umbrella or waterproof raincoat!")
        elif category == "snow":
            clothing.append("Wear waterproof boots with non-slip grip.")
            
        if is_day and uv_max >= 5:
            clothing.append("Wear UV-blocking sunglasses and apply SPF 30+ sunscreen.")

        # 2. Outdoor Activity Suitability Score (0-100)
        activity_score = 100
        penalties = []
        
        # Rain / Snow penalties
        if category == "thunderstorm":
            activity_score -= 50
            penalties.append("Thunderstorms present risk of lightning.")
        elif category == "rain":
            activity_score -= 30
            penalties.append("Wet conditions reduce outdoor traction.")
        elif category == "snow":
            activity_score -= 25
            penalties.append("Snowfall affects visibility and road grip.")
            
        # Extreme Temp penalties
        if temp > 35:
            activity_score -= 30
            penalties.append("High thermal stress risks heat exhaustion.")
        elif temp < 0:
            activity_score -= 25
            penalties.append("Sub-zero chill poses frostbite risk.")
            
        # Wind penalty
        if wind_speed > 35:
            activity_score -= 20
            penalties.append("Strong gusts can be hazardous for cycling and outdoor sports.")
            
        # Air Quality penalty
        if aqi_val > 100:
            activity_score -= 25
            penalties.append("Unhealthy Air Quality Index (AQI). Limit heavy outdoor exertion.")

        activity_score = max(10, min(100, activity_score))

        # Recommended Activities
        recommended_activities = []
        if activity_score >= 80:
            recommended_activities = ["Morning Jogging & Running", "Outdoor Photography", "Cycling", "Picnic in the Park", "Sightseeing"]
        elif 50 <= activity_score < 80:
            recommended_activities = ["Brisk Walking", "Café Hopping", "Short Hike", "Indoor Gym Session", "Museum Visit"]
        else:
            recommended_activities = ["Indoor Cinema / Theatre", "Cozy Home Reading", "Indoor Swimming Pool", "Gaming & Cooking"]

        # 3. Health & Environment Advisory
        health_advisories = []
        if uv_max >= 8:
            health_advisories.append("⚠️ **Very High UV Index**: Limit direct sun exposure between 11 AM - 4 PM.")
        if aqi_val > 100:
            health_advisories.append("😷 **Air Quality Alert**: Sensitive individuals (asthma/allergies) should wear a mask outside.")
        if humidity > 85 and temp > 28:
            health_advisories.append("💧 **High Muggy Humidity**: Ensure frequent water intake to stay hydrated.")
        if wind_speed > 40:
            health_advisories.append("💨 **High Wind Advisory**: Watch for falling tree branches or loose outdoor items.")

        if not health_advisories:
            health_advisories.append("✨ Weather parameters are optimal with no major environmental health alerts.")

        # 4. Natural AI Summary
        time_period = "today" if is_day else "tonight"
        sky_desc = current.get("description", "Clear").lower()
        summary = (
            f"Currently in {weather_data.get('location', {}).get('name', 'your area')}, expect {sky_desc} conditions "
            f"with a temperature around {temp}°C (feels like {feels_like}°C). Humidity is at {humidity}% and winds "
            f"are blowing at {wind_speed} km/h. Overall outdoor activity score is {activity_score}/100."
        )

        return {
            "summary": summary,
            "clothing": " ".join(clothing),
            "activity_score": activity_score,
            "recommended_activities": recommended_activities,
            "health_advisories": health_advisories
        }
