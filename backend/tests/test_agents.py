import pytest
from app.schemas.trip import TripCreateRequest
from app.data.grounded_data import is_valid_indian_destination
from app.agents.trip_intake_agent import trip_intake_agent
from app.agents.orchestrator import orchestrator

def test_india_destination_validation():
    # Valid destinations
    assert is_valid_indian_destination("Goa")[0] is True
    assert is_valid_indian_destination("Hyderabad")[0] is True
    assert is_valid_indian_destination("Munnar")[0] is True
    assert is_valid_indian_destination("Meghalaya")[0] is True
    assert is_valid_indian_destination("Manali")[0] is True

    # International destinations must be rejected
    is_valid, reason = is_valid_indian_destination("Paris")
    assert is_valid is False
    assert "outside India" in reason

    is_valid, reason = is_valid_indian_destination("Dubai")
    assert is_valid is False
    assert "outside India" in reason

    is_valid, reason = is_valid_indian_destination("Bali")
    assert is_valid is False
    assert "outside India" in reason

@pytest.mark.asyncio
async def test_foreign_destination_pipeline_rejection():
    req = TripCreateRequest(
        origin_city="Delhi",
        destination="London",
        duration_days=5
    )
    result = await orchestrator.execute_travel_pipeline(req)
    assert result["is_valid"] is False
    assert "outside India" in result["rejection_reason"]

@pytest.mark.asyncio
async def test_full_multi_agent_pipeline_execution():
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
    result = await orchestrator.execute_travel_pipeline(req)
    assert result["is_valid"] is True
    
    # Check verification checks
    verification = result["verification"]
    assert verification.is_valid is True
    assert len(verification.checks) == 12
    assert all(c.passed for c in verification.checks)

    # Check that agent logs recorded all 8 stages
    agent_logs = result["agent_logs"]
    assert len(agent_logs) >= 8
    agent_names = [l["agent_name"] for l in agent_logs]
    assert "Trip Intake Agent" in agent_names
    assert "Destination Research Agent" in agent_names
    assert "Transportation Agent" in agent_names
    assert "Accommodation Agent" in agent_names
    assert "Budget Prediction Agent" in agent_names
    assert "Itinerary Agent" in agent_names
    assert "Verification Agent" in agent_names
