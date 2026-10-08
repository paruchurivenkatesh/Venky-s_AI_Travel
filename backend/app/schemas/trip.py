from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class TripCreateRequest(BaseModel):
    origin_city: str = Field(default="Hyderabad", description="Starting city in India")
    destination: str = Field(default="Goa", description="Indian destination")
    duration_days: int = Field(default=4, ge=1, le=30)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    adults_count: int = Field(default=2, ge=1, le=20)
    children_count: int = Field(default=0, ge=0, le=10)
    budget_amount: Optional[float] = None
    budget_mode: str = Field(default="Standard", description="Budget, Standard, Premium")
    travel_style: str = Field(default="Friends", description="Solo, Couple, Family, Friends, Backpacker")
    accommodation_pref: str = Field(default="3 Star", description="Hostel, Budget, 3 Star, 4 Star, 5 Star")
    transport_pref: str = Field(default="Balanced", description="Cheapest, Balanced, Fastest, Comfortable")
    food_pref: str = Field(default="Local & Authentic")
    interests: List[str] = Field(default_factory=lambda: ["Beaches", "Food", "Culture"])
    language: str = Field(default="English")

class TripUpdateRequest(BaseModel):
    title: Optional[str] = None
    is_favorite: Optional[bool] = None

class BudgetOptimizeRequest(BaseModel):
    action: Optional[str] = "reduce" # reduce, fit_budget, faster, comfortable
    max_budget: Optional[float] = None

class FitBudgetRequest(BaseModel):
    target_budget: float

class ChatMessageRequest(BaseModel):
    message: str

class RecalculateRequest(BaseModel):
    duration_days: Optional[int] = None
    budget_mode: Optional[str] = None
    accommodation_pref: Optional[str] = None

class ActivityResponse(BaseModel):
    id: str
    time_slot: str
    activity_title: str
    location_name: str
    approx_time: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    travel_time_mins: int
    estimated_cost: float
    description: Optional[str]
    category: str
    is_grounded: bool

    model_config = ConfigDict(from_attributes=True)

class ItineraryDayResponse(BaseModel):
    id: str
    day_number: int
    title: str
    theme: Optional[str]
    daily_estimated_cost: float
    daily_distance_km: float
    local_transport_mode: Optional[str]
    lunch_recommendation: Optional[str]
    dinner_recommendation: Optional[str]
    activities: List[ActivityResponse] = []

    model_config = ConfigDict(from_attributes=True)

class HotelResponse(BaseModel):
    id: str
    name: str
    category: str
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    price_per_night: float
    total_nights: int
    rating: float
    amenities_json: List[str] = []
    match_score: int
    source: str
    confidence: str
    is_selected: bool
    image_url: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class BudgetBreakdownResponse(BaseModel):
    predicted_total: float
    per_person: float
    per_day: float
    transport_cost: float
    accommodation_cost: float
    food_cost: float
    local_transport_cost: float
    activities_cost: float
    misc_cost: float
    buffer_cost: float
    lower_range: float
    upper_range: float
    overall_confidence: int
    grounding_ratio: int
    components_json: Dict[str, Any] = {}
    explanation_json: Dict[str, Any] = {}
    savings_tips_json: List[Any] = []

    model_config = ConfigDict(from_attributes=True)

class TripDestinationResponse(BaseModel):
    destination_name: str
    state_name: str
    latitude: Optional[float]
    longitude: Optional[float]
    best_time: Optional[str]
    ideal_duration_days: int
    description: Optional[str]
    famous_food_json: List[Any] = []
    culture_highlights: Optional[str]
    weather_summary: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class AgentRunResponse(BaseModel):
    agent_name: str
    status: str
    duration_ms: int
    source_count: int
    error_message: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class TripResponse(BaseModel):
    id: str
    title: str
    origin_city: str
    destination: str
    duration_days: int
    travelers_count: int
    adults_count: int
    children_count: int
    budget_amount: Optional[float]
    budget_mode: str
    travel_style: str
    accommodation_pref: str
    transport_pref: str
    language: str
    status: str
    is_favorite: bool
    created_at: datetime
    destination_details: Optional[TripDestinationResponse] = None
    budget_breakdown: Optional[BudgetBreakdownResponse] = None
    hotels: List[HotelResponse] = []
    itinerary_days: List[ItineraryDayResponse] = []
    agent_runs: List[AgentRunResponse] = []
    advisor_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
