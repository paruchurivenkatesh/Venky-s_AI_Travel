import logging
from app.schemas.agents import AccommodationResult, HotelOption, TripIntakeResult
from app.services.hotel_service import hotel_service

logger = logging.getLogger(__name__)

class AccommodationAgent:
    """
    Retrieves and ranks hotel options from Koson India Hotel API / Grounded Directory,
    filters by traveler category preference, and computes multi-night stay totals.
    """
    async def run(self, intake: TripIntakeResult) -> AccommodationResult:
        nights = intake.nights
        pref = intake.accommodation_pref

        # Search hotels from hotel service
        raw_hotels = await hotel_service.search_hotels(
            destination=intake.destination,
            category_pref=pref
        )

        hotel_options: list[HotelOption] = []
        for h in raw_hotels:
            price_night = h["price_per_night"]
            total_price = price_night * nights
            hotel_options.append(HotelOption(
                id=h["id"],
                name=h["name"],
                category=h.get("category", "3 Star"),
                location=h["location"],
                latitude=h.get("latitude", 0.0),
                longitude=h.get("longitude", 0.0),
                price_per_night=price_night,
                total_price=total_price,
                rating=h.get("rating", 4.3),
                amenities=h.get("amenities", ["Wi-Fi", "Breakfast"]),
                match_score=h.get("match_score", 92),
                image_url=h.get("image_url", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"),
                source=h.get("source", "Koson India Hotel API / Grounded"),
                confidence=h.get("confidence", "HIGH")
            ))

        # Select closest matching hotel to user preference
        selected = None
        pref_lower = pref.lower()
        for h in hotel_options:
            if pref_lower in h.category.lower() or h.category.lower() in pref_lower:
                selected = h
                break

        if not selected and hotel_options:
            selected = hotel_options[0]

        total_accommodation = selected.total_price if selected else 0.0

        reasoning = (
            f"Selected '{selected.name}' ({selected.category}) at ₹{selected.price_per_night:,.0f}/night "
            f"for {nights} night(s). Total stay: ₹{total_accommodation:,.0f}. Source: {selected.source}."
        )

        return AccommodationResult(
            hotels=hotel_options,
            selected_hotel=selected,
            nights=nights,
            total_accommodation_cost=total_accommodation,
            reasoning=reasoning
        )

accommodation_agent = AccommodationAgent()
