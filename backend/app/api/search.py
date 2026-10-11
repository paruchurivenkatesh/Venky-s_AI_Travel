from typing import Optional
from fastapi import APIRouter, Query
from app.services.google_maps_service import google_maps_service
from app.services.hotel_service import hotel_service

router = APIRouter(tags=["Search & Utility"])

@router.get("/search/places")
async def search_places(destination: str = Query("Goa"), query: Optional[str] = None):
    results = await google_maps_service.search_places(destination, query or "tourist attraction")
    return {"destination": destination, "results": results}

@router.get("/search/hotels")
async def search_hotels(
    destination: str = Query("Goa"),
    category: str = Query("3 Star")
):
    results = await hotel_service.search_hotels(destination, category)
    return {"destination": destination, "results": results}

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Venky's AI Travel Backend",
        "country": "India Only",
        "agents_ready": True
    }
