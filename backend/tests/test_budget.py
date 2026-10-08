import pytest
from app.schemas.trip import TripCreateRequest
from app.agents.trip_intake_agent import trip_intake_agent
from app.agents.destination_agent import destination_agent
from app.agents.transport_agent import transport_agent
from app.agents.accommodation_agent import accommodation_agent
from app.agents.poi_agent import poi_agent
from app.agents.tourism_agent import tourism_agent
from app.agents.budget_prediction_agent import budget_prediction_agent

@pytest.mark.asyncio
async def test_budget_engine_deterministic_arithmetic():
    req = TripCreateRequest(
        origin_city="Hyderabad",
        destination="Goa",
        duration_days=4,
        adults_count=2,
        children_count=0,
        budget_amount=25000.0,
        travel_style="Friends",
        accommodation_pref="3 Star",
        transport_pref="Balanced"
    )

    intake = trip_intake_agent.run(req)
    assert intake.is_valid_india is True
    assert intake.duration_days == 4
    assert intake.nights == 3 # nights = duration - 1
    assert intake.travelers_count == 2

    dest = await destination_agent.run(intake)
    transport = await transport_agent.run(intake)
    stay = await accommodation_agent.run(intake)
    poi = await poi_agent.run(intake)
    tourism = await tourism_agent.run(intake)

    budget = await budget_prediction_agent.run(intake, dest, transport, stay, poi, tourism)

    # 1. Deterministic component sum must equal predicted total
    component_sum = (
        budget.transportation_prediction.amount +
        budget.accommodation_prediction.amount +
        budget.food_prediction.amount +
        budget.local_transport_prediction.amount +
        budget.activities_prediction.amount +
        budget.miscellaneous_prediction.amount +
        budget.emergency_buffer_prediction.amount
    )
    assert abs(component_sum - budget.predicted_total) < 0.01

    # 2. Per person calculation
    expected_per_person = round(budget.predicted_total / 2, 0)
    assert abs(budget.per_person - expected_per_person) <= 1.0

    # 3. Per day calculation
    expected_per_day = round(budget.predicted_total / 4, 0)
    assert abs(budget.per_day - expected_per_day) <= 1.0

    # 4. Range interval consistency
    assert budget.lower_range <= budget.predicted_total <= budget.upper_range

    # 5. Confidence score within valid bounds
    assert 60 <= budget.overall_confidence <= 100
    assert 50 <= budget.grounding_ratio <= 100
