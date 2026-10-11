import logging
from typing import List
from app.schemas.agents import (
    ItineraryResult, ItineraryDayPlan, ItineraryActivity,
    TripIntakeResult, POIResult, DestinationResearchResult,
    RouteOptimizationResult, BudgetResult
)

logger = logging.getLogger(__name__)

class ItineraryAgent:
    """
    Constructs a realistic, balanced day-by-day travel schedule
    with Morning, Afternoon, and Evening activities, dining spots,
    commute allowances, and daily expenditure pacing.
    """
    def run(
        self,
        intake: TripIntakeResult,
        dest: DestinationResearchResult,
        poi: POIResult,
        routes: RouteOptimizationResult,
        budget: BudgetResult
    ) -> ItineraryResult:
        days_count = intake.duration_days
        attractions = poi.attractions
        food_list = dest.famous_food
        daily_cost_pace = round(budget.predicted_total / max(1, days_count), 0)

        day_plans: List[ItineraryDayPlan] = []
        attraction_idx = 0
        total_attractions = len(attractions)

        themes = [
            "Arrival & Heritage Discovery",
            "Iconic Landmarks & Panoramic Vistas",
            "Coastal & Nature Exploration",
            "Cultural Immersion & Local Bazaars",
            "Hidden Trails & Scenic Escapes",
            "Leisure, Wellness & Sunset Farewell"
        ]

        for d in range(1, days_count + 1):
            theme = themes[(d - 1) % len(themes)]
            
            # Select Morning activity
            if total_attractions > 0:
                p_morning = attractions[attraction_idx % total_attractions]
                attraction_idx += 1
            else:
                p_morning = None

            # Select Afternoon activity
            if total_attractions > 0:
                p_afternoon = attractions[attraction_idx % total_attractions]
                attraction_idx += 1
            else:
                p_afternoon = None

            # Select Evening activity
            if total_attractions > 0:
                p_evening = attractions[attraction_idx % total_attractions]
                attraction_idx += 1
            else:
                p_evening = None

            m_title = p_morning.name if p_morning else f"Explore Central {intake.destination}"
            m_loc = p_morning.address if p_morning else f"City Center, {intake.destination}"
            m_cost = p_morning.entry_fee if p_morning else 50.0

            a_title = p_afternoon.name if p_afternoon else f"Cultural Quarter Tour"
            a_loc = p_afternoon.address if p_afternoon else f"Old Town, {intake.destination}"
            a_cost = p_afternoon.entry_fee if p_afternoon else 30.0

            e_title = p_evening.name if p_evening else f"Sunset Viewpoint & Night Market"
            e_loc = p_evening.address if p_evening else f"Promenade, {intake.destination}"
            e_cost = p_evening.entry_fee if p_evening else 0.0

            lunch_rec = (
                f"Savor authentic {food_list[0]['name']} at {food_list[0]['famous_spot']}"
                if food_list else "Traditional regional thali at local heritage restaurant"
            )
            dinner_rec = (
                f"Enjoy {food_list[min(1, len(food_list)-1)]['name']} with sunset ambiance"
                if food_list else "Rooftop dining with city skyline / river views"
            )

            morning_act = ItineraryActivity(
                time_slot="Morning",
                approx_time="09:00 AM - 12:00 PM",
                title=m_title,
                location=m_loc,
                latitude=p_morning.latitude if p_morning else 0.0,
                longitude=p_morning.longitude if p_morning else 0.0,
                travel_time_mins=25,
                estimated_cost=m_cost,
                description=f"Begin Day {d} discovering the architectural and historical depth of {m_title}.",
                category=p_morning.category if p_morning else "Sightseeing"
            )

            afternoon_act = ItineraryActivity(
                time_slot="Afternoon",
                approx_time="01:30 PM - 04:30 PM",
                title=a_title,
                location=a_loc,
                latitude=p_afternoon.latitude if p_afternoon else 0.0,
                longitude=p_afternoon.longitude if p_afternoon else 0.0,
                travel_time_mins=20,
                estimated_cost=a_cost,
                description=f"Post lunch, venture into {a_title} for immersive exploration and photography.",
                category=p_afternoon.category if p_afternoon else "Culture"
            )

            evening_act = ItineraryActivity(
                time_slot="Evening",
                approx_time="05:30 PM - 08:00 PM",
                title=e_title,
                location=e_loc,
                latitude=p_evening.latitude if p_evening else 0.0,
                longitude=p_evening.longitude if p_evening else 0.0,
                travel_time_mins=15,
                estimated_cost=e_cost,
                description=f"Unwind with scenic evening breeze, twilight photos, and local bazaar strolls at {e_title}.",
                category=p_evening.category if p_evening else "Sunset"
            )

            day_plan = ItineraryDayPlan(
                day_number=d,
                title=f"Day {d} in {intake.destination}",
                theme=theme,
                morning=morning_act,
                afternoon=afternoon_act,
                evening=evening_act,
                lunch_recommendation=lunch_rec,
                dinner_recommendation=dinner_rec,
                daily_estimated_cost=daily_cost_pace,
                daily_distance_km=round(18.5 + (d * 1.5), 1)
            )
            day_plans.append(day_plan)

        overview = (
            f"A thoughtfully curated {days_count}-day journey across {intake.destination}, "
            f"featuring {len(day_plans)} structured days that harmonize cultural exploration, "
            f"scenic viewpoints, authentic culinary stops, and comfortable transit buffers."
        )

        return ItineraryResult(
            total_days=days_count,
            overview=overview,
            days=day_plans
        )

itinerary_agent = ItineraryAgent()
