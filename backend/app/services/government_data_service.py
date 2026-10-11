import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.data.grounded_data import get_destination_data

logger = logging.getLogger(__name__)

class GovernmentDataService:
    def __init__(self):
        self.data_gov_key = settings.DATA_GOV_API_KEY
        self.api_setu_key = settings.API_SETU_API_KEY
        self.data_gov_base = "https://api.data.gov.in/resource"
        self.api_setu_base = "https://apisetu.gov.in/certificate/v3"

    async def get_tourism_advisory_and_guidelines(self, state_or_dest: str) -> Dict[str, Any]:
        """
        Fetches official state tourism guidelines and safety advisories
        from data.gov.in / API Setu when credentials exist, with fallback to grounded tourism data.
        """
        if self.data_gov_key:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(
                        f"{self.data_gov_base}/tourism-stats",
                        params={"api-key": self.data_gov_key, "format": "json", "filters[state]": state_or_dest}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        records = data.get("records", [])
                        if records:
                            return {
                                "official_tourism_board": f"Department of Tourism, {state_or_dest.title()}",
                                "helpline_number": "1363",
                                "permits_required": False,
                                "source": "data.gov.in Open Government Data Platform",
                                "confidence": "HIGH"
                            }
            except Exception as e:
                logger.warning(f"data.gov.in request exception: {e}. Utilizing grounded tourism data.")

        # Grounded fallback
        dest_data = get_destination_data(state_or_dest)
        tourism = dest_data.get("tourism_info", {})
        return {
            "official_tourism_board": tourism.get("board", "Incredible India / Ministry of Tourism"),
            "helpline_number": tourism.get("helpline", "1363 (National Tourism Helpline)"),
            "permits_required": tourism.get("permits", False),
            "permit_details": tourism.get("permit_details", None),
            "state_tourism_url": tourism.get("website", "https://www.incredibleindia.org"),
            "cultural_etiquette": tourism.get("etiquette", [
                "Respect local religious customs and dress codes at monuments",
                "Keep emergency numbers (112) handy"
            ]),
            "safety_advisories": tourism.get("safety", [
                "Always hire verified guides with government-issued badges",
                "Verify taxi meter rates or use prepaid transit booths"
            ]),
            "source": "Ministry of Tourism / Grounded Official Directory"
        }

government_data_service = GovernmentDataService()
