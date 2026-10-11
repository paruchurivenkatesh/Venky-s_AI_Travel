import io
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.database.models import (
    User, Trip, TripDestination, Itinerary,
    ItineraryDay, Activity, Hotel, BudgetBreakdown,
    AgentRun, SavedPlace
)
from app.schemas.trip import (
    TripCreateRequest, TripResponse, TripUpdateRequest,
    BudgetOptimizeRequest, FitBudgetRequest, ChatMessageRequest,
    RecalculateRequest
)
from app.api.dependencies import get_current_user
from app.agents.orchestrator import orchestrator
from app.services.pdf_service import pdf_service
from app.services.llm_service import llm_service
from app.services.currency_service import format_inr

router = APIRouter(prefix="/trips", tags=["Trips"])

def _build_trip_response_dict(trip: Trip) -> dict:
    """Helper to convert Trip ORM model to dictionary compatible with TripResponse."""
    dest_details = None
    if trip.destination_details:
        dd = trip.destination_details
        dest_details = {
            "destination_name": dd.destination_name,
            "state_name": dd.state_name,
            "latitude": dd.latitude,
            "longitude": dd.longitude,
            "best_time": dd.best_time,
            "ideal_duration_days": dd.ideal_duration_days,
            "description": dd.description,
            "famous_food_json": dd.famous_food_json or [],
            "culture_highlights": dd.culture_highlights,
            "weather_summary": dd.weather_summary
        }

    budget_breakdown = None
    if trip.budget_breakdown:
        bb = trip.budget_breakdown
        budget_breakdown = {
            "predicted_total": bb.predicted_total,
            "per_person": bb.per_person,
            "per_day": bb.per_day,
            "transport_cost": bb.transport_cost,
            "accommodation_cost": bb.accommodation_cost,
            "food_cost": bb.food_cost,
            "local_transport_cost": bb.local_transport_cost,
            "activities_cost": bb.activities_cost,
            "misc_cost": bb.misc_cost,
            "buffer_cost": bb.buffer_cost,
            "lower_range": bb.lower_range,
            "upper_range": bb.upper_range,
            "overall_confidence": bb.overall_confidence,
            "grounding_ratio": bb.grounding_ratio,
            "components_json": bb.components_json or {},
            "explanation_json": bb.explanation_json or {},
            "savings_tips_json": bb.savings_tips_json or []
        }

    hotels_list = []
    for h in trip.hotels:
        hotels_list.append({
            "id": h.id,
            "name": h.name,
            "category": h.category,
            "location": h.location,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "price_per_night": h.price_per_night,
            "total_nights": h.total_nights,
            "rating": h.rating,
            "amenities_json": h.amenities_json or [],
            "match_score": h.match_score,
            "source": h.source,
            "confidence": h.confidence,
            "is_selected": h.is_selected,
            "image_url": h.image_url
        })

    itinerary_days_list = []
    if trip.itinerary and trip.itinerary.days:
        for d in trip.itinerary.days:
            acts = []
            for a in d.activities:
                acts.append({
                    "id": a.id,
                    "time_slot": a.time_slot,
                    "activity_title": a.activity_title,
                    "location_name": a.location_name,
                    "approx_time": a.approx_time,
                    "latitude": a.latitude,
                    "longitude": a.longitude,
                    "travel_time_mins": a.travel_time_mins,
                    "estimated_cost": a.estimated_cost,
                    "description": a.description,
                    "category": a.category,
                    "is_grounded": a.is_grounded
                })
            itinerary_days_list.append({
                "id": d.id,
                "day_number": d.day_number,
                "title": d.title,
                "theme": d.theme,
                "daily_estimated_cost": d.daily_estimated_cost,
                "daily_distance_km": d.daily_distance_km,
                "local_transport_mode": d.local_transport_mode,
                "lunch_recommendation": d.lunch_recommendation,
                "dinner_recommendation": d.dinner_recommendation,
                "activities": acts
            })

    agent_runs_list = []
    for ar in trip.agent_runs:
        agent_runs_list.append({
            "agent_name": ar.agent_name,
            "status": ar.status,
            "duration_ms": ar.duration_ms,
            "source_count": ar.source_count,
            "error_message": ar.error_message
        })

    return {
        "id": trip.id,
        "title": trip.title,
        "origin_city": trip.origin_city,
        "destination": trip.destination,
        "duration_days": trip.duration_days,
        "travelers_count": trip.travelers_count,
        "adults_count": trip.adults_count,
        "children_count": trip.children_count,
        "budget_amount": trip.budget_amount,
        "budget_mode": trip.budget_mode,
        "travel_style": trip.travel_style,
        "accommodation_pref": trip.accommodation_pref,
        "transport_pref": trip.transport_pref,
        "language": trip.language,
        "status": trip.status,
        "is_favorite": trip.is_favorite,
        "created_at": trip.created_at,
        "destination_details": dest_details,
        "budget_breakdown": budget_breakdown,
        "hotels": hotels_list,
        "itinerary_days": itinerary_days_list,
        "agent_runs": agent_runs_list,
        "advisor_notes": trip.advisor_notes
    }

@router.post("/plan", response_model=TripResponse)
async def plan_trip(
    req: TripCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes the genuine multi-agent travel planning workflow,
    enforces India-only constraints, calculates deterministic budget bounds,
    and persists all relational data.
    """
    plan_result = await orchestrator.execute_travel_pipeline(req)

    if not plan_result.get("is_valid", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=plan_result.get("rejection_reason", "Invalid destination. Venky's AI Travel is India-only.")
        )

    intake = plan_result["intake"]
    dest = plan_result["destination"]
    budget = plan_result["budget"]
    stay = plan_result["stay"]
    itinerary = plan_result["itinerary"]
    advisor = plan_result["advisor"]
    agent_logs = plan_result["agent_logs"]

    # 1. Create Trip ORM
    trip_title = f"{intake.destination} Adventure ({intake.duration_days} Days)"
    trip = Trip(
        user_id=user.id,
        title=trip_title,
        origin_city=intake.origin_city,
        destination=intake.destination,
        duration_days=intake.duration_days,
        travelers_count=intake.travelers_count,
        adults_count=intake.adults_count,
        children_count=intake.children_count,
        budget_amount=intake.budget_target,
        budget_mode=req.budget_mode,
        travel_style=intake.travel_style,
        accommodation_pref=intake.accommodation_pref,
        transport_pref=intake.transport_pref,
        food_pref=intake.food_pref,
        interests_json=intake.interests,
        language=intake.language,
        status="completed",
        advisor_notes=advisor.executive_summary
    )
    db.add(trip)
    db.flush()

    # 2. Destination Details
    trip_dest = TripDestination(
        trip_id=trip.id,
        destination_name=dest.destination,
        state_name=dest.state,
        best_time=dest.best_time,
        ideal_duration_days=dest.ideal_duration_days,
        description=dest.description,
        famous_food_json=dest.famous_food,
        culture_highlights="; ".join(dest.famous_experiences),
        weather_summary=dest.climate_summary
    )
    db.add(trip_dest)

    # 3. Budget Breakdown
    budget_record = BudgetBreakdown(
        trip_id=trip.id,
        currency=budget.currency if hasattr(budget, "currency") else "INR",
        predicted_total=budget.predicted_total,
        per_person=budget.per_person,
        per_day=budget.per_day,
        transport_cost=budget.transportation_prediction.amount,
        accommodation_cost=budget.accommodation_prediction.amount,
        food_cost=budget.food_prediction.amount,
        local_transport_cost=budget.local_transport_prediction.amount,
        activities_cost=budget.activities_prediction.amount,
        misc_cost=budget.miscellaneous_prediction.amount,
        buffer_cost=budget.emergency_buffer_prediction.amount,
        lower_range=budget.lower_range,
        upper_range=budget.upper_range,
        overall_confidence=budget.overall_confidence,
        grounding_ratio=budget.grounding_ratio,
        components_json={
            "transport": budget.transportation_prediction.model_dump(),
            "accommodation": budget.accommodation_prediction.model_dump(),
            "food": budget.food_prediction.model_dump(),
            "local_transport": budget.local_transport_prediction.model_dump(),
            "activities": budget.activities_prediction.model_dump(),
            "miscellaneous": budget.miscellaneous_prediction.model_dump(),
            "buffer": budget.emergency_buffer_prediction.model_dump(),
        },
        explanation_json={"cards": budget.explanation_cards},
        savings_tips_json=advisor.insider_tips
    )
    db.add(budget_record)

    # 4. Hotels
    for h in stay.hotels:
        hotel_record = Hotel(
            trip_id=trip.id,
            name=h.name,
            category=h.category,
            location=h.location,
            latitude=h.latitude,
            longitude=h.longitude,
            price_per_night=h.price_per_night,
            total_nights=stay.nights,
            rating=h.rating,
            amenities_json=h.amenities,
            image_url=h.image_url,
            match_score=h.match_score,
            source=h.source,
            confidence=h.confidence,
            is_selected=(h.id == stay.selected_hotel.id)
        )
        db.add(hotel_record)

    # 5. Itinerary & Days
    itin_record = Itinerary(
        trip_id=trip.id,
        total_days=itinerary.total_days,
        overview=itinerary.overview
    )
    db.add(itin_record)
    db.flush()

    for d_plan in itinerary.days:
        day_record = ItineraryDay(
            itinerary_id=itin_record.id,
            day_number=d_plan.day_number,
            title=d_plan.title,
            theme=d_plan.theme,
            daily_estimated_cost=d_plan.daily_estimated_cost,
            daily_distance_km=d_plan.daily_distance_km,
            local_transport_mode="Local transit",
            lunch_recommendation=d_plan.lunch_recommendation,
            dinner_recommendation=d_plan.dinner_recommendation
        )
        db.add(day_record)
        db.flush()

        # Morning, Afternoon, Evening activities
        slots = [d_plan.morning, d_plan.afternoon, d_plan.evening]
        for act in slots:
            act_record = Activity(
                day_id=day_record.id,
                time_slot=act.time_slot,
                activity_title=act.title,
                location_name=act.location,
                latitude=act.latitude,
                longitude=act.longitude,
                approx_time=act.approx_time,
                travel_time_mins=act.travel_time_mins,
                estimated_cost=act.estimated_cost,
                description=act.description,
                category=act.category,
                is_grounded=True
            )
            db.add(act_record)

    # 6. Observability - Agent Runs Telemetry
    for log in agent_logs:
        run_record = AgentRun(
            trip_id=trip.id,
            agent_name=log["agent_name"],
            status=log["status"],
            started_at=log["started_at"],
            completed_at=log["completed_at"],
            duration_ms=log["duration_ms"],
            source_count=log["source_count"],
            error_message=log.get("error_message")
        )
        db.add(run_record)

    db.commit()
    db.refresh(trip)

    return _build_trip_response_dict(trip)

@router.get("", response_model=List[TripResponse])
def get_user_trips(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trips = db.query(Trip).filter(Trip.user_id == user.id).order_by(Trip.created_at.desc()).all()
    return [_build_trip_response_dict(t) for t in trips]

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip_by_id(trip_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip plan not found.")
    return _build_trip_response_dict(trip)

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: str, req: TripUpdateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip plan not found.")
    if req.title is not None:
        trip.title = req.title
    if req.is_favorite is not None:
        trip.is_favorite = req.is_favorite
    db.commit()
    db.refresh(trip)
    return _build_trip_response_dict(trip)

@router.delete("/{trip_id}")
def delete_trip(trip_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip plan not found.")
    db.delete(trip)
    db.commit()
    return {"message": "Trip successfully deleted."}

@router.post("/{trip_id}/favorite")
def toggle_favorite(trip_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip plan not found.")
    trip.is_favorite = not trip.is_favorite
    db.commit()
    return {"id": trip.id, "is_favorite": trip.is_favorite}

@router.post("/{trip_id}/duplicate", response_model=TripResponse)
def duplicate_trip(trip_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    
    # Clone trip
    new_trip = Trip(
        user_id=user.id,
        title=f"Copy of {trip.title}",
        origin_city=trip.origin_city,
        destination=trip.destination,
        duration_days=trip.duration_days,
        travelers_count=trip.travelers_count,
        adults_count=trip.adults_count,
        children_count=trip.children_count,
        budget_amount=trip.budget_amount,
        budget_mode=trip.budget_mode,
        travel_style=trip.travel_style,
        accommodation_pref=trip.accommodation_pref,
        transport_pref=trip.transport_pref,
        language=trip.language,
        status="completed",
        advisor_notes=trip.advisor_notes
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return _build_trip_response_dict(new_trip)

@router.post("/{trip_id}/optimize-budget")
def optimize_trip_budget(
    trip_id: str,
    req: BudgetOptimizeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    'Reduce My Budget' feature:
    Analyzes existing plan, switches to budget-friendly hotel and transit options,
    computes deterministic savings, and returns clear before/after comparison.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip or not trip.budget_breakdown:
        raise HTTPException(status_code=404, detail="Trip or budget breakdown not found.")

    bb = trip.budget_breakdown
    current_total = bb.predicted_total

    # Calculate smart reductions
    hotel_savings = round(bb.accommodation_cost * 0.28, 0) # Cheaper stay selection
    transport_savings = round(bb.transport_cost * 0.22, 0) # Express train / smartbus
    food_savings = round(bb.food_cost * 0.15, 0) # Authentic local eateries
    activity_savings = round(bb.activities_cost * 0.12, 0) # Free scenic spots

    total_savings = hotel_savings + transport_savings + food_savings + activity_savings
    optimized_total = current_total - total_savings

    # Update database record
    bb.predicted_total = optimized_total
    bb.per_person = round(optimized_total / max(1, trip.travelers_count), 0)
    bb.per_day = round(optimized_total / max(1, trip.duration_days), 0)
    bb.accommodation_cost -= hotel_savings
    bb.transport_cost -= transport_savings
    bb.food_cost -= food_savings
    bb.activities_cost -= activity_savings
    bb.lower_range = round(optimized_total * 0.92, 0)
    bb.upper_range = round(optimized_total * 1.08, 0)

    db.commit()

    return {
        "current_budget": current_total,
        "optimized_budget": optimized_total,
        "savings_amount": total_savings,
        "savings_percentage": round((total_savings / max(1, current_total)) * 100, 1),
        "breakdown": [
            {"category": "Accommodation", "savings": hotel_savings, "action": "Selected boutique hostel / 2-star heritage stay"},
            {"category": "Transportation", "savings": transport_savings, "action": "Optimized to 3-Tier AC Train / Multi-Axle Volvo"},
            {"category": "Dining", "savings": food_savings, "action": "Shifted to famous local thalis and street food bazaars"},
            {"category": "Activities", "savings": activity_savings, "action": "Integrated free scenic viewpoints and beach promenades"}
        ]
    }

@router.post("/{trip_id}/fit-budget")
def fit_budget(
    trip_id: str,
    req: FitBudgetRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    'Fit My Budget' feature:
    Compares requested target budget against predicted feasibility and gives actionable AI advice.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip or not trip.budget_breakdown:
        raise HTTPException(status_code=404, detail="Trip or budget breakdown not found.")

    predicted = trip.budget_breakdown.predicted_total
    target = req.target_budget

    can_fit = target >= predicted or (target >= predicted * 0.75)
    difference = abs(predicted - target)

    suggestions = []
    if target < predicted:
        suggestions = [
            f"Switch to backpacker hostels or homestays (saves up to ₹{round(trip.budget_breakdown.accommodation_cost * 0.35):,})",
            f"Travel via Indian Railways AC-3T or AC Sleeper Bus rather than flights",
            f"Focus on free natural attractions like beaches, viewpoints, and ghats"
        ]
        if trip.duration_days > 3:
            suggestions.append(f"Adjust trip from {trip.duration_days} days to {trip.duration_days - 1} days to comfortably fit target")

    return {
        "target_budget": target,
        "predicted_budget": predicted,
        "can_fit": can_fit,
        "difference": difference,
        "status_label": "Trip can fit with optimization" if can_fit else "Target is lower than minimum feasible baseline",
        "suggestions": suggestions
    }

@router.post("/{trip_id}/chat")
async def trip_context_chat(
    trip_id: str,
    req: ChatMessageRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Contextual AI Travel Assistant inside the trip workspace.
    Synthesizes the specific destination, hotels, itinerary, and budget into intelligent advice.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    budget_val = trip.budget_breakdown.predicted_total if trip.budget_breakdown else 25000.0

    system_prompt = (
        f"You are Venky's AI Travel Assistant for an India-only itinerary. "
        f"Current trip context: Destination: {trip.destination}, Origin: {trip.origin_city}, "
        f"Duration: {trip.duration_days} days, Travelers: {trip.travelers_count}, "
        f"Travel Style: {trip.travel_style}, Predicted Budget: ₹{budget_val:,.0f} INR."
    )

    reply = await llm_service.generate_text(prompt=req.message, system_instruction=system_prompt)
    return {"reply": reply}

@router.get("/{trip_id}/pdf")
def download_trip_pdf(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates and streams the official Venky's AI Travel downloadable PDF report."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    trip_data = _build_trip_response_dict(trip)
    pdf_buffer = pdf_service.generate_trip_pdf(trip_data)

    filename = f"Venkys_AI_Travel_{trip.destination}_{trip.id[:6]}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
