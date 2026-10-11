import asyncio
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Callable, Optional

from app.schemas.trip import TripCreateRequest
from app.schemas.agents import (
    TripIntakeResult, DestinationResearchResult,
    TransportResult, AccommodationResult,
    POIResult, TourismDataResult, BudgetResult,
    RouteOptimizationResult, ItineraryResult,
    TravelAdvisorResult, VerificationResult
)

from app.agents.trip_intake_agent import trip_intake_agent
from app.agents.destination_agent import destination_agent
from app.agents.transport_agent import transport_agent
from app.agents.accommodation_agent import accommodation_agent
from app.agents.poi_agent import poi_agent
from app.agents.tourism_agent import tourism_agent
from app.agents.budget_prediction_agent import budget_prediction_agent
from app.agents.route_agent import route_agent
from app.agents.itinerary_agent import itinerary_agent
from app.agents.travel_advisor_agent import travel_advisor_agent
from app.agents.verification_agent import verification_agent

logger = logging.getLogger(__name__)

class MultiAgentOrchestrator:
    """
    Coordinates genuine multi-agent execution pipeline:
    1. Trip Intake / User Profile Agent
    2. Destination Research Agent
    3. Concurrent Research (Transport, Accommodation, POIs, Tourism)
    4. AI Budget Prediction & Validation Agent
    5. Route Optimization Agent
    6. Itinerary Agent
    7. Travel Advisor Agent
    8. Verification Agent (12-point audit & reconciliation)
    """

    async def execute_travel_pipeline(
        self,
        request: TripCreateRequest,
        on_progress: Optional[Callable[[str, int], None]] = None
    ) -> Dict[str, Any]:
        agent_logs: List[Dict[str, Any]] = []

        async def record_run(name: str, coroutine_func, *args, **kwargs):
            start_t = time.perf_counter()
            started_at = datetime.now(timezone.utc)
            try:
                if asyncio.iscoroutinefunction(coroutine_func):
                    res = await coroutine_func(*args, **kwargs)
                else:
                    res = coroutine_func(*args, **kwargs)
                duration_ms = int((time.perf_counter() - start_t) * 1000)
                agent_logs.append({
                    "agent_name": name,
                    "status": "COMPLETED",
                    "started_at": started_at,
                    "completed_at": datetime.now(timezone.utc),
                    "duration_ms": max(1, duration_ms),
                    "source_count": 1,
                    "error_message": None,
                    "output": res
                })
                return res
            except Exception as e:
                duration_ms = int((time.perf_counter() - start_t) * 1000)
                logger.error(f"Agent {name} failed: {e}", exc_info=True)
                agent_logs.append({
                    "agent_name": name,
                    "status": "FAILED",
                    "started_at": started_at,
                    "completed_at": datetime.now(timezone.utc),
                    "duration_ms": duration_ms,
                    "source_count": 0,
                    "error_message": str(e),
                    "output": None
                })
                raise

        # Stage 1: Trip Intake Agent
        if on_progress:
            on_progress("Understanding your travel preferences", 10)
        intake_res: TripIntakeResult = await record_run(
            "Trip Intake Agent",
            trip_intake_agent.run,
            request
        )

        if not intake_res.is_valid_india:
            return {
                "is_valid": False,
                "rejection_reason": intake_res.rejection_reason,
                "intake": intake_res,
                "agent_logs": agent_logs
            }

        # Stage 2: Destination Research Agent
        if on_progress:
            on_progress("Researching destination and cultural highlights", 25)
        dest_res: DestinationResearchResult = await record_run(
            "Destination Research Agent",
            destination_agent.run,
            intake_res
        )

        # Stage 3: Concurrent Parallel Research
        if on_progress:
            on_progress("Analyzing transportation, hotels & attractions concurrently", 45)

        transport_task = record_run("Transportation Agent", transport_agent.run, intake_res)
        stay_task = record_run("Accommodation Agent", accommodation_agent.run, intake_res)
        poi_task = record_run("Places & POI Agent", poi_agent.run, intake_res)
        tourism_task = record_run("Tourism Data Agent", tourism_agent.run, intake_res)

        transport_res, stay_res, poi_res, tourism_res = await asyncio.gather(
            transport_task, stay_task, poi_task, tourism_task
        )

        # Stage 4: AI Budget Prediction Agent
        if on_progress:
            on_progress("Predicting budget and running arithmetic validation", 65)
        budget_res: BudgetResult = await record_run(
            "Budget Prediction Agent",
            budget_prediction_agent.run,
            intake_res, dest_res, transport_res, stay_res, poi_res, tourism_res
        )

        # Stage 5: Route Optimization Agent
        if on_progress:
            on_progress("Optimizing route clusters and geographic travel paths", 75)
        route_res: RouteOptimizationResult = await record_run(
            "Route Optimization Agent",
            route_agent.run,
            poi_res, intake_res.duration_days
        )

        # Stage 6: Itinerary Agent
        if on_progress:
            on_progress("Generating balanced day-by-day travel timeline", 85)
        itinerary_res: ItineraryResult = await record_run(
            "Itinerary Agent",
            itinerary_agent.run,
            intake_res, dest_res, poi_res, route_res, budget_res
        )

        # Stage 7: Generative Travel Advisor Agent
        if on_progress:
            on_progress("Synthesizing personalized advice and regional tips", 92)
        advisor_res: TravelAdvisorResult = await record_run(
            "Travel Advisor Agent",
            travel_advisor_agent.run,
            intake_res, dest_res, budget_res, itinerary_res
        )

        # Stage 8: Verification Agent
        if on_progress:
            on_progress("Running 12-point quality and arithmetic verification", 98)
        verification_res: VerificationResult = await record_run(
            "Verification Agent",
            verification_agent.run,
            intake_res, dest_res, transport_res, stay_res, poi_res, budget_res, itinerary_res
        )

        if on_progress:
            on_progress("Your Incredible India plan is ready!", 100)

        return {
            "is_valid": True,
            "intake": intake_res,
            "destination": dest_res,
            "transport": transport_res,
            "stay": stay_res,
            "poi": poi_res,
            "tourism": tourism_res,
            "budget": budget_res,
            "route": route_res,
            "itinerary": itinerary_res,
            "advisor": advisor_res,
            "verification": verification_res,
            "agent_logs": agent_logs
        }

orchestrator = MultiAgentOrchestrator()
