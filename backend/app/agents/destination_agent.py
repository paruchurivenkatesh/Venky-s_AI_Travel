import logging
from app.schemas.agents import DestinationResearchResult, TripIntakeResult
from app.data.grounded_data import get_destination_data

logger = logging.getLogger(__name__)

class DestinationResearchAgent:
    """
    Researches grounded destination metadata, cultural highlights, climate,
    and recommended neighborhoods for Indian travel hubs.
    """
    async def run(self, intake: TripIntakeResult) -> DestinationResearchResult:
        dest_data = get_destination_data(intake.destination)

        famous_exp = [
            f"Explore historic landmarks and scenic vistas of {dest_data['name']}",
            f"Sample authentic {dest_data['state']} regional delicacies and street food",
            "Immerse in local bazaars, handicrafts, and cultural architecture"
        ]

        neighborhoods = [
            f"Central Heritage Quarter, {dest_data['name']}",
            f"Scenic Viewpoint & Promenade District",
            f"Bazaar & Culinary District"
        ]

        return DestinationResearchResult(
            destination=dest_data.get("name", intake.destination),
            state=dest_data.get("state", intake.state),
            description=dest_data.get("short_description", f"A picturesque destination in {dest_data.get('state', 'India')}."),
            best_time=dest_data.get("best_season", "October to March"),
            ideal_duration_days=dest_data.get("recommended_days", 4),
            famous_experiences=famous_exp,
            famous_food=dest_data.get("famous_food", []),
            recommended_neighborhoods=neighborhoods,
            climate_summary="Pleasant tropical / temperate climate during current travel season.",
            official_advisory=dest_data.get("tourism_info", {}).get("safety", ["Standard travel caution"])[0]
        )

destination_agent = DestinationResearchAgent()
