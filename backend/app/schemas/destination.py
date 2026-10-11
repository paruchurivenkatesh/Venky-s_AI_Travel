from typing import List, Optional
from pydantic import BaseModel

class DestinationCard(BaseModel):
    id: str
    name: str
    state: str
    region: str # South, North, West, East, North-East, Central, Island
    short_description: str
    best_season: str
    recommended_days: int
    travel_styles: List[str]
    interests: List[str]
    typical_budget_per_day: float
    image_url: str
    is_featured: bool = True
    ai_badge: str = "AI Selected"

class DestinationRecommendRequest(BaseModel):
    origin_city: str = "Hyderabad"
    budget: float = 15000.0
    days: int = 4
    travelers: int = 1
    interests: Optional[List[str]] = None
    query: Optional[str] = None # e.g. "I have ₹15,000 and 4 days from Hyderabad"

class RecommendedDestinationItem(BaseModel):
    destination: str
    state: str
    why_it_fits: str
    estimated_budget: float
    suggested_days: int
    travel_style: str
    best_experiences: List[str]
    expected_travel_effort: str
    image_url: str

class DestinationRecommendResponse(BaseModel):
    recommendations: List[RecommendedDestinationItem]
    query_analyzed: str
