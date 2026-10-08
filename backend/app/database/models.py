import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    language_pref = Column(String(20), default="English")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    favorite_destinations = relationship("FavoriteDestination", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    favorite_style = Column(String(50), default="Standard")
    default_travelers = Column(Integer, default=2)
    home_city = Column(String(100), default="Hyderabad")
    avatar_url = Column(String(500), nullable=True)

    user = relationship("User", back_populates="profile")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    origin_city = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False, index=True)
    start_date = Column(String(20), nullable=True)
    end_date = Column(String(20), nullable=True)
    duration_days = Column(Integer, nullable=False, default=4)
    travelers_count = Column(Integer, nullable=False, default=2)
    adults_count = Column(Integer, default=2)
    children_count = Column(Integer, default=0)
    budget_amount = Column(Float, nullable=True) # User-provided target budget
    budget_mode = Column(String(50), default="Standard") # Budget, Standard, Luxury/Premium
    travel_style = Column(String(50), default="Standard") # Backpacker, Couple, Family, Solo, Friends
    accommodation_pref = Column(String(50), default="3 Star") # Hostel, Budget, 3 Star, 4 Star, 5 Star
    transport_pref = Column(String(50), default="Balanced") # Cheapest, Balanced, Fastest, Comfortable
    food_pref = Column(String(50), default="Local & Authentic")
    interests_json = Column(JSON, default=list) # List of tags: beaches, heritage, nature, etc.
    language = Column(String(30), default="English")
    status = Column(String(50), default="completed") # planning, completed, archived
    is_favorite = Column(Boolean, default=False)
    advisor_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="trips")
    destination_details = relationship("TripDestination", back_populates="trip", uselist=False, cascade="all, delete-orphan")
    itinerary = relationship("Itinerary", back_populates="trip", uselist=False, cascade="all, delete-orphan")
    hotels = relationship("Hotel", back_populates="trip", cascade="all, delete-orphan")
    budget_breakdown = relationship("BudgetBreakdown", back_populates="trip", uselist=False, cascade="all, delete-orphan")
    saved_places = relationship("SavedPlace", back_populates="trip", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="trip", cascade="all, delete-orphan")


class TripDestination(Base):
    __tablename__ = "trip_destinations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_name = Column(String(100), nullable=False)
    state_name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    best_time = Column(String(100), nullable=True)
    ideal_duration_days = Column(Integer, default=4)
    description = Column(Text, nullable=True)
    famous_food_json = Column(JSON, default=list)
    culture_highlights = Column(Text, nullable=True)
    weather_summary = Column(String(255), nullable=True)

    trip = relationship("Trip", back_populates="destination_details")


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    total_days = Column(Integer, nullable=False)
    overview = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="itinerary")
    days = relationship("ItineraryDay", back_populates="itinerary", cascade="all, delete-orphan", order_by="ItineraryDay.day_number")


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    itinerary_id = Column(String(36), ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    theme = Column(String(255), nullable=True)
    daily_estimated_cost = Column(Float, default=0.0)
    daily_distance_km = Column(Float, default=0.0)
    local_transport_mode = Column(String(100), default="Cabs & Auto-rickshaws")
    lunch_recommendation = Column(String(255), nullable=True)
    dinner_recommendation = Column(String(255), nullable=True)

    itinerary = relationship("Itinerary", back_populates="days")
    activities = relationship("Activity", back_populates="day", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    day_id = Column(String(36), ForeignKey("itinerary_days.id", ondelete="CASCADE"), nullable=False, index=True)
    time_slot = Column(String(20), nullable=False) # Morning, Afternoon, Evening
    activity_title = Column(String(255), nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    approx_time = Column(String(50), nullable=True) # e.g. "09:00 AM - 11:30 AM"
    travel_time_mins = Column(Integer, default=20)
    estimated_cost = Column(Float, default=0.0) # Entry fee or ticket
    description = Column(Text, nullable=True)
    is_grounded = Column(Boolean, default=True)
    category = Column(String(50), default="Sightseeing")

    day = relationship("ItineraryDay", back_populates="activities")


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), default="3 Star")
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    price_per_night = Column(Float, nullable=False)
    total_nights = Column(Integer, nullable=False, default=3)
    rating = Column(Float, default=4.2)
    amenities_json = Column(JSON, default=list)
    image_url = Column(String(500), nullable=True)
    match_score = Column(Integer, default=90) # e.g. 92%
    source = Column(String(100), default="Koson India Hotel API / Grounded")
    confidence = Column(String(20), default="HIGH")
    is_selected = Column(Boolean, default=False)

    trip = relationship("Trip", back_populates="hotels")


class BudgetBreakdown(Base):
    __tablename__ = "budget_breakdowns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, unique=True)
    currency = Column(String(10), default="INR")
    predicted_total = Column(Float, nullable=False)
    per_person = Column(Float, nullable=False)
    per_day = Column(Float, nullable=False)
    transport_cost = Column(Float, nullable=False)
    accommodation_cost = Column(Float, nullable=False)
    food_cost = Column(Float, nullable=False)
    local_transport_cost = Column(Float, nullable=False)
    activities_cost = Column(Float, nullable=False)
    misc_cost = Column(Float, nullable=False)
    buffer_cost = Column(Float, nullable=False)
    lower_range = Column(Float, nullable=False)
    upper_range = Column(Float, nullable=False)
    overall_confidence = Column(Integer, default=91) # 91%
    grounding_ratio = Column(Integer, default=78) # 78% grounded data
    components_json = Column(JSON, default=dict)
    explanation_json = Column(JSON, default=dict)
    savings_tips_json = Column(JSON, default=list)
    last_calculated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="budget_breakdown")


class SavedPlace(Base):
    __tablename__ = "saved_places"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), default="Attraction")
    address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    rating = Column(Float, default=4.5)
    entry_fee = Column(Float, default=0.0)
    best_time_to_visit = Column(String(100), nullable=True)
    is_must_visit = Column(Boolean, default=True)

    trip = relationship("Trip", back_populates="saved_places")


class FavoriteDestination(Base):
    __tablename__ = "favorite_destinations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_name = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="favorite_destinations")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False)
    status = Column(String(50), default="COMPLETED") # RUNNING, COMPLETED, FAILED, RETRIED
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, default=0)
    source_count = Column(Integer, default=1)
    error_message = Column(Text, nullable=True)
    structured_output_json = Column(JSON, default=dict)

    trip = relationship("Trip", back_populates="agent_runs")
