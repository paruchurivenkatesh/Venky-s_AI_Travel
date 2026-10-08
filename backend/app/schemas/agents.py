from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GroundedValue(BaseModel):
    value: float
    currency: str = "INR"
    source: str = "API / Dataset / Grounded"
    source_name: str = "Venky's India Travel Knowledge Base"
    confidence: str = "HIGH" # HIGH, MEDIUM, LOW
    is_grounded: bool = True
    last_updated: Optional[str] = "Current Season 2026"

class TripIntakeResult(BaseModel):
    origin_city: str
    destination: str
    state: str
    is_valid_india: bool = True
    rejection_reason: Optional[str] = None
    duration_days: int
    nights: int
    travelers_count: int
    adults_count: int
    children_count: int
    budget_target: Optional[float] = None
    travel_style: str
    accommodation_pref: str
    transport_pref: str
    food_pref: str
    interests: List[str]
    language: str

class DestinationResearchResult(BaseModel):
    destination: str
    state: str
    description: str
    best_time: str
    ideal_duration_days: int
    famous_experiences: List[str]
    famous_food: List[Dict[str, Any]]
    recommended_neighborhoods: List[str]
    climate_summary: str
    official_advisory: Optional[str] = None

class TransportOption(BaseModel):
    mode: str # Flight, Train, Bus, Cab
    operator_or_type: str # e.g. Vande Bharat Express, Indigo, AC Sleeper
    estimated_fare_per_person: float
    total_fare: float
    travel_time_hours: float
    departure_hub: str
    arrival_hub: str
    source: str = "Indian Railways / Bus Matrix / Flight Grounding"
    confidence: str = "HIGH"

class TransportResult(BaseModel):
    origin: str
    destination: str
    distance_km: float
    intercity_options: List[TransportOption]
    selected_option: TransportOption
    local_transport_mode: str
    local_transport_daily_estimate: float
    total_transport_budget: float
    reasoning: str

class HotelOption(BaseModel):
    id: str
    name: str
    category: str # Hostel, Budget, 3 Star, 4 Star, 5 Star
    location: str
    latitude: float
    longitude: float
    price_per_night: float
    total_price: float
    rating: float
    amenities: List[str]
    match_score: int
    image_url: str
    source: str = "Koson India Hotel API / Grounded Directory"
    confidence: str = "HIGH"

class AccommodationResult(BaseModel):
    hotels: List[HotelOption]
    selected_hotel: HotelOption
    nights: int
    total_accommodation_cost: float
    reasoning: str

class POIItem(BaseModel):
    name: str
    category: str
    address: str
    latitude: float
    longitude: float
    rating: float
    entry_fee: float
    best_time_slot: str # Morning, Afternoon, Evening
    typical_duration_hours: float
    cluster_zone: str
    image_url: Optional[str] = None
    is_grounded: bool = True

class POIResult(BaseModel):
    destination: str
    attractions: List[POIItem]
    total_entry_fees: float
    cluster_count: int

class TourismDataResult(BaseModel):
    official_tourism_board: str
    helpline_number: str
    permits_required: bool = False
    permit_details: Optional[str] = None
    state_tourism_url: Optional[str] = None
    cultural_etiquette: List[str]
    safety_advisories: List[str]

class BudgetComponentPrediction(BaseModel):
    amount: float
    currency: str = "INR"
    confidence: int = Field(ge=0, le=100) # 0-100%
    reasoning_summary: str
    source_type: str = "API GROUNDED" # API GROUNDED, AI PREDICTED, ESTIMATED
    sources: List[str] = []

class BudgetResult(BaseModel):
    transportation_prediction: BudgetComponentPrediction
    accommodation_prediction: BudgetComponentPrediction
    food_prediction: BudgetComponentPrediction
    local_transport_prediction: BudgetComponentPrediction
    activities_prediction: BudgetComponentPrediction
    miscellaneous_prediction: BudgetComponentPrediction
    emergency_buffer_prediction: BudgetComponentPrediction
    predicted_total: float
    per_person: float
    per_day: float
    lower_range: float
    upper_range: float
    overall_confidence: int = 91
    grounding_ratio: int = 78
    explanation_cards: List[Dict[str, Any]] = []

class ItineraryActivity(BaseModel):
    time_slot: str # Morning, Afternoon, Evening
    approx_time: str
    title: str
    location: str
    latitude: float
    longitude: float
    travel_time_mins: int
    estimated_cost: float
    description: str
    category: str

class ItineraryDayPlan(BaseModel):
    day_number: int
    title: str
    theme: str
    morning: ItineraryActivity
    afternoon: ItineraryActivity
    evening: ItineraryActivity
    lunch_recommendation: str
    dinner_recommendation: str
    daily_estimated_cost: float
    daily_distance_km: float

class ItineraryResult(BaseModel):
    total_days: int
    overview: str
    days: List[ItineraryDayPlan]

class RouteOptimizationResult(BaseModel):
    clusters: List[Dict[str, Any]]
    total_estimated_km: float
    optimization_summary: str

class TravelAdvisorResult(BaseModel):
    executive_summary: str
    personalized_highlights: List[str]
    packing_checklist: List[str]
    local_food_guide: List[Dict[str, Any]]
    insider_tips: List[str]
    language_greetings: Dict[str, str]

class VerificationCheckItem(BaseModel):
    check_name: str
    passed: bool
    details: str

class VerificationResult(BaseModel):
    is_valid: bool
    checks: List[VerificationCheckItem]
    failed_checks: List[str] = []
    corrections_applied: List[str] = []
    confidence_verdict: str = "PASSED"
