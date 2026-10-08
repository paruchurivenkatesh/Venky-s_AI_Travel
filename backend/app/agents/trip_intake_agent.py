import logging
from app.schemas.trip import TripCreateRequest
from app.schemas.agents import TripIntakeResult
from app.data.grounded_data import is_valid_indian_destination, get_destination_data

logger = logging.getLogger(__name__)

class TripIntakeAgent:
    """
    Validates trip request, enforces INDIA-ONLY destination constraint,
    normalizes travelers and durations, and returns structured TripIntakeResult.
    """
    def run(self, request: TripCreateRequest) -> TripIntakeResult:
        is_valid, rejection_reason = is_valid_indian_destination(request.destination)
        
        if not is_valid:
            return TripIntakeResult(
                origin_city=request.origin_city.strip().title(),
                destination=request.destination.strip().title(),
                state="Unknown / International",
                is_valid_india=False,
                rejection_reason=rejection_reason,
                duration_days=request.duration_days,
                nights=max(1, request.duration_days - 1),
                travelers_count=request.adults_count + request.children_count,
                adults_count=request.adults_count,
                children_count=request.children_count,
                budget_target=request.budget_amount,
                travel_style=request.travel_style,
                accommodation_pref=request.accommodation_pref,
                transport_pref=request.transport_pref,
                food_pref=request.food_pref,
                interests=request.interests,
                language=request.language
            )

        dest_data = get_destination_data(request.destination)
        total_travelers = max(1, request.adults_count + request.children_count)
        duration = max(1, min(30, request.duration_days))
        nights = max(1, duration - 1)

        return TripIntakeResult(
            origin_city=request.origin_city.strip().title(),
            destination=dest_data.get("name", request.destination.strip().title()),
            state=dest_data.get("state", "India"),
            is_valid_india=True,
            rejection_reason=None,
            duration_days=duration,
            nights=nights,
            travelers_count=total_travelers,
            adults_count=request.adults_count,
            children_count=request.children_count,
            budget_target=request.budget_amount,
            travel_style=request.travel_style,
            accommodation_pref=request.accommodation_pref,
            transport_pref=request.transport_pref,
            food_pref=request.food_pref,
            interests=request.interests or ["Beaches", "Culture", "Food"],
            language=request.language or "English"
        )

trip_intake_agent = TripIntakeAgent()
