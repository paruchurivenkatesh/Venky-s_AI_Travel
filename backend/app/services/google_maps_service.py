import logging
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.data.grounded_data import get_destination_data

logger = logging.getLogger(__name__)

class GoogleMapsService:
    def __init__(self):
        self.api_key = settings.GOOGLE_MAPS_API_KEY
        self.base_url = "https://maps.googleapis.com/maps/api"

    async def geocode_destination(self, address: str) -> Optional[Dict[str, float]]:
        """Geocodes an address or destination name to {lat, lng}."""
        if not self.api_key:
            dest_data = get_destination_data(address)
            return {"lat": dest_data.get("latitude", 20.5937), "lng": dest_data.get("longitude", 78.9629)}

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(
                    f"{self.base_url}/geocode/json",
                    params={"address": f"{address}, India", "key": self.api_key}
                )
                data = resp.json()
                if data.get("status") == "OK" and data.get("results"):
                    loc = data["results"][0]["geometry"]["location"]
                    return {"lat": loc["lat"], "lng": loc["lng"]}
        except Exception as e:
            logger.warning(f"Google Maps Geocoding API failed: {e}. Falling back to grounded coordinates.")
        
        dest_data = get_destination_data(address)
        return {"lat": dest_data.get("latitude", 20.5937), "lng": dest_data.get("longitude", 78.9629)}

    async def search_places(self, destination: str, query: str = "tourist attraction") -> List[Dict[str, Any]]:
        """Searches POIs / attractions using Google Places API with fallback to grounded POIs."""
        if not self.api_key:
            dest_data = get_destination_data(destination)
            return dest_data.get("attractions", [])

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(
                    f"{self.base_url}/place/textsearch/json",
                    params={"query": f"{query} in {destination}, India", "key": self.api_key}
                )
                data = resp.json()
                if data.get("status") == "OK" and data.get("results"):
                    results = []
                    for item in data["results"][:8]:
                        loc = item.get("geometry", {}).get("location", {})
                        results.append({
                            "name": item.get("name"),
                            "category": "Attraction",
                            "address": item.get("formatted_address", f"{destination}, India"),
                            "latitude": loc.get("lat", 0.0),
                            "longitude": loc.get("lng", 0.0),
                            "rating": item.get("rating", 4.5),
                            "entry_fee": 50.0,
                            "time_slot": "Morning",
                            "duration_hours": 2.0,
                            "cluster_zone": f"{destination} Zone",
                            "is_grounded": True,
                            "source": "Google Places API Live"
                        })
                    return results
        except Exception as e:
            logger.warning(f"Google Places API failed: {e}. Utilizing grounded destination POIs.")

        dest_data = get_destination_data(destination)
        return dest_data.get("attractions", [])

google_maps_service = GoogleMapsService()
