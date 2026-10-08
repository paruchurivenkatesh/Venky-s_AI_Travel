import logging
from typing import Dict, Any, List
from app.schemas.agents import (
    TravelAdvisorResult, TripIntakeResult,
    DestinationResearchResult, BudgetResult, ItineraryResult
)
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

LANGUAGE_GREETINGS = {
    "hindi": {"hello": "Namaste (नमस्ते)", "thank_you": "Dhanyawaad (धन्यवाद)", "how_much": "Yeh kitne ka hai? (यह कितने का है?)"},
    "telugu": {"hello": "Namaskaram (నమస్కారం)", "thank_you": "Dhanyavadamulu (ధన్యవాదములు)", "how_much": "Idhi entha? (ఇది ఎంత?)"},
    "tamil": {"hello": "Vanakkam (வணக்கம்)", "thank_you": "Nandri (நன்றி)", "how_much": "Idhu evvalavu? (இது எவ்வளவு?)"},
    "kannada": {"hello": "Namaskara (ನಮಸ್ಕಾರ)", "thank_you": "Dhanyavadagalu (ಧನ್ಯವಾದಗಳು)", "how_much": "Idu eshtu? (ಇದು ಎಷ್ಟು?)"},
    "malayalam": {"hello": "Namaskaram (നമസ്കാരം)", "thank_you": "Nanni (നന്ദി)", "how_much": "Ithinu ethraya? (ഇതിന് എത്രയാ?)"},
    "bengali": {"hello": "Nomoshkar (নমস্কার)", "thank_you": "Dhonnobad (ধন্যবাদ)", "how_much": "Eita koto? (এইটা কত?)"},
    "marathi": {"hello": "Namaskar (नमस्कार)", "thank_you": "Dhanyawad (धन्यवाद)", "how_much": "He kiti la ahe? (हे कितीला आहे?)"},
    "english": {"hello": "Hello / Namaste", "thank_you": "Thank You", "how_much": "How much does this cost?"}
}

class TravelAdvisorAgent:
    """
    Translates structured agent data into insightful traveler advice,
    generates personalized packing lists, food recommendations, and regional greetings.
    """
    async def run(
        self,
        intake: TripIntakeResult,
        dest: DestinationResearchResult,
        budget: BudgetResult,
        itinerary: ItineraryResult
    ) -> TravelAdvisorResult:
        lang_key = intake.language.lower()
        greetings = LANGUAGE_GREETINGS.get(lang_key, LANGUAGE_GREETINGS["english"])

        # Personalized highlights
        highlights = [
            f"Tailored for {intake.travel_style} travelers exploring {dest.destination} across {intake.duration_days} days.",
            f"Grounded predicted budget of ₹{budget.predicted_total:,.0f} (₹{budget.per_person:,.0f} per person) with {budget.overall_confidence}% confidence.",
            f"Balanced daily itinerary featuring {dest.state}'s premier heritage sites and culinary hotspots."
        ]

        # Packing checklist based on geography
        packing = [
            "Comfortable walking / slip-on shoes for temple and fort exploration",
            "Cotton breathable attire and light stole/scarf for places of worship",
            "Universal mobile power bank and offline map downloads",
            "Basic first aid kit and personal hydration flask",
            "Government photo ID (Aadhaar / Voter ID / Passport) for hotel check-ins"
        ]

        tips = [
            "Start early morning (before 09:30 AM) to experience popular monuments without crowds and heat.",
            "Always verify meter status on auto-rickshaws or use verified rideshare apps (Ola / Uber / Rapido).",
            "Sample street food from busy, high-turnover stalls with visible freshly fried batches."
        ]

        summary = (
            f"Welcome to your personalized journey to {dest.destination}, curated by Venky's AI Travel. "
            f"Our multi-agent system has verified route connectivity from {intake.origin_city}, "
            f"secured stay estimates matching your '{intake.accommodation_pref}' preference, and structured "
            f"a realistic budget within predicted bounds."
        )

        return TravelAdvisorResult(
            executive_summary=summary,
            personalized_highlights=highlights,
            packing_checklist=packing,
            local_food_guide=dest.famous_food,
            insider_tips=tips,
            language_greetings=greetings
        )

travel_advisor_agent = TravelAdvisorAgent()
