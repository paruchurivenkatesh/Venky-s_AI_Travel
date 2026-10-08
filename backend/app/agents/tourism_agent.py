import logging
from app.schemas.agents import TourismDataResult, TripIntakeResult
from app.services.government_data_service import government_data_service

logger = logging.getLogger(__name__)

class TourismDataAgent:
    """
    Interfaces with official Ministry of Tourism / data.gov.in / state boards
    to retrieve grounded advisories, helpline numbers, and permit requirements.
    """
    async def run(self, intake: TripIntakeResult) -> TourismDataResult:
        gov_data = await government_data_service.get_tourism_advisory_and_guidelines(intake.destination)

        return TourismDataResult(
            official_tourism_board=gov_data.get("official_tourism_board", "Ministry of Tourism, Govt of India"),
            helpline_number=gov_data.get("helpline_number", "1363 (24x7 Multi-lingual Tourist Helpline)"),
            permits_required=gov_data.get("permits_required", False),
            permit_details=gov_data.get("permit_details", None),
            state_tourism_url=gov_data.get("state_tourism_url", "https://www.incredibleindia.org"),
            cultural_etiquette=gov_data.get("cultural_etiquette", [
                "Dress modestly at heritage shrines",
                "Remove footwear where customary",
                "Avoid single-use plastic in eco-sensitive zones"
            ]),
            safety_advisories=gov_data.get("safety_advisories", [
                "Utilize licensed prepaid cabs and registered tour guides",
                "Emergency emergency response dial 112"
            ])
        )

tourism_agent = TourismDataAgent()
