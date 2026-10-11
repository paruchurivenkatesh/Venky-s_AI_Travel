import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import Base, engine

# Ensure test DB tables exist
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_health_and_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["scope"] == "INDIA ONLY"

    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_auth_flow():
    email = "test.traveler.2026@example.com"
    # Register
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Test Traveler",
        "language_pref": "English"
    })
    assert reg_res.status_code in (200, 400) # 200 or 400 if already exists

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

def test_destinations_and_recommender():
    res = client.get("/api/destinations")
    assert res.status_code == 200
    destinations = res.json()
    assert len(destinations) >= 5

    # Smart recommender
    rec_res = client.post("/api/destinations/recommend", json={
        "origin_city": "Hyderabad",
        "budget": 15000.0,
        "days": 4,
        "query": "I have ₹15,000 and 4 days from Hyderabad"
    })
    assert rec_res.status_code == 200
    data = rec_res.json()
    assert len(data["recommendations"]) >= 1

def test_trip_plan_and_pdf_generation():
    # Plan trip for Hyderabad to Goa
    plan_res = client.post("/api/trips/plan", json={
        "origin_city": "Hyderabad",
        "destination": "Goa",
        "duration_days": 4,
        "adults_count": 2,
        "children_count": 0,
        "budget_amount": 25000.0,
        "travel_style": "Friends",
        "accommodation_pref": "3 Star",
        "transport_pref": "Balanced",
        "interests": ["Beaches", "Food", "Culture"],
        "language": "English"
    })
    assert plan_res.status_code == 200
    trip = plan_res.json()
    trip_id = trip["id"]
    assert trip["destination"] == "Goa"
    assert trip["budget_breakdown"]["predicted_total"] > 0
    assert len(trip["itinerary_days"]) == 4
    assert len(trip["hotels"]) >= 1

    # Test PDF generation endpoint
    pdf_res = client.get(f"/api/trips/{trip_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

    # Test Budget Optimization
    opt_res = client.post(f"/api/trips/{trip_id}/optimize-budget", json={"action": "reduce"})
    assert opt_res.status_code == 200
    opt_data = opt_res.json()
    assert opt_data["optimized_budget"] < opt_data["current_budget"]
    assert opt_data["savings_amount"] > 0
