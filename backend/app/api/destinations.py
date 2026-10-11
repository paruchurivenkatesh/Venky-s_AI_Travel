import re
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.data.grounded_data import DESTINATIONS_DATA
from app.schemas.destination import (
    DestinationCard, DestinationRecommendRequest,
    DestinationRecommendResponse, RecommendedDestinationItem
)

router = APIRouter(prefix="/destinations", tags=["Destinations"])

@router.get("", response_model=List[DestinationCard])
def list_destinations(
    region: Optional[str] = None,
    state: Optional[str] = None,
    tag: Optional[str] = None
):
    """Returns curated Indian destination cards for the Explore India catalog."""
    cards: List[DestinationCard] = []
    for key, d in DESTINATIONS_DATA.items():
        if region and d.get("region", "").lower() != region.lower():
            continue
        if state and state.lower() not in d.get("state", "").lower():
            continue
        if tag and not any(tag.lower() in t.lower() for t in d.get("travel_styles", [])):
            continue

        cards.append(DestinationCard(
            id=key,
            name=d["name"],
            state=d["state"],
            region=d.get("region", "South"),
            short_description=d["short_description"],
            best_season=d["best_season"],
            recommended_days=d["recommended_days"],
            travel_styles=d["travel_styles"],
            interests=d["travel_styles"],
            typical_budget_per_day=d.get("typical_budget_per_day", 2800.0),
            image_url=d["image_url"],
            is_featured=True,
            ai_badge="AI Selected"
        ))
    return cards

@router.get("/{dest_id}", response_model=DestinationCard)
def get_destination(dest_id: str):
    key = dest_id.lower().strip()
    if key not in DESTINATIONS_DATA:
        raise HTTPException(status_code=404, detail="Destination not found.")
    d = DESTINATIONS_DATA[key]
    return DestinationCard(
        id=key,
        name=d["name"],
        state=d["state"],
        region=d.get("region", "South"),
        short_description=d["short_description"],
        best_season=d["best_season"],
        recommended_days=d["recommended_days"],
        travel_styles=d["travel_styles"],
        interests=d["travel_styles"],
        typical_budget_per_day=d.get("typical_budget_per_day", 2800.0),
        image_url=d["image_url"],
        is_featured=True,
        ai_badge="AI Selected"
    )

@router.post("/recommend", response_model=DestinationRecommendResponse)
def recommend_destinations(req: DestinationRecommendRequest):
    """
    'Where should I go?' Smart Destination Recommender.
    Parses natural language queries (e.g. 'I have ₹15,000 and 4 days from Hyderabad')
    or structured parameters, and returns 3-5 grounded recommendations.
    """
    budget = req.budget
    days = req.days
    origin = req.origin_city

    # Natural language parsing if query is provided
    if req.query:
        # Extract budget amount if present (e.g. 15,000 or 15000 or 20k)
        amt_match = re.search(r'₹?\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(?:k|thousand))?', req.query, re.IGNORECASE)
        if amt_match:
            try:
                raw_num = amt_match.group(1).replace(',', '')
                val = float(raw_num)
                if 'k' in req.query.lower():
                    val *= 1000
                if val >= 3000:
                    budget = val
            except Exception:
                pass

        # Extract days
        days_match = re.search(r'(\d+)\s*(?:day|days)', req.query, re.IGNORECASE)
        if days_match:
            try:
                days = int(days_match.group(1))
            except Exception:
                pass

        # Extract origin
        from_match = re.search(r'from\s+([a-zA-Z\s]+)', req.query, re.IGNORECASE)
        if from_match:
            origin = from_match.group(1).strip().title()

    results: List[RecommendedDestinationItem] = []
    
    # Filter and rank Indian destinations
    for key, d in DESTINATIONS_DATA.items():
        dest_daily = d.get("typical_budget_per_day", 2800.0)
        est_total = dest_daily * days + 3000.0 # adding baseline transit
        
        # Determine fitness
        why = f"Fits your budget of ₹{budget:,.0f} and {days}-day timeline from {origin}. Excellent connectivity and pleasant season."
        effort = "Comfortable (Overnight Train or Direct 1.5h Flight)"
        
        if est_total <= budget * 1.3: # Close enough or within
            results.append(RecommendedDestinationItem(
                destination=d["name"],
                state=d["state"],
                why_it_fits=why,
                estimated_budget=est_total,
                suggested_days=min(days, d["recommended_days"]),
                travel_style=d["travel_styles"][0] if d.get("travel_styles") else "Leisure",
                best_experiences=d.get("travel_styles", [])[:3],
                expected_travel_effort=effort,
                image_url=d["image_url"]
            ))

    if not results: # fallback to top 3
        for key in list(DESTINATIONS_DATA.keys())[:3]:
            d = DESTINATIONS_DATA[key]
            results.append(RecommendedDestinationItem(
                destination=d["name"],
                state=d["state"],
                why_it_fits=f"Highly recommended versatile journey from {origin}.",
                estimated_budget=budget,
                suggested_days=days,
                travel_style="Standard",
                best_experiences=d.get("travel_styles", [])[:3],
                expected_travel_effort="Moderate",
                image_url=d["image_url"]
            ))

    return DestinationRecommendResponse(
        recommendations=results[:4],
        query_analyzed=f"Analyzed {origin} origin · ₹{budget:,.0f} budget · {days} days"
    )
