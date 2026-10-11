import logging
from app.schemas.agents import TransportResult, TransportOption, TripIntakeResult
from app.data.grounded_data import get_transit_options

logger = logging.getLogger(__name__)

class TransportAgent:
    """
    Evaluates multi-modal travel options between Indian origin and destination,
    computes passenger fares, and estimates intra-city transit allowances.
    """
    async def run(self, intake: TripIntakeResult) -> TransportResult:
        raw_options = get_transit_options(intake.origin_city, intake.destination)
        travelers = intake.travelers_count
        duration = intake.duration_days
        pref = intake.transport_pref.lower()

        options: list[TransportOption] = []
        for opt in raw_options:
            fare_per_person = opt["estimated_fare_per_person"]
            total_fare = fare_per_person * travelers
            options.append(TransportOption(
                mode=opt["mode"],
                operator_or_type=opt["operator_or_type"],
                estimated_fare_per_person=fare_per_person,
                total_fare=total_fare,
                travel_time_hours=opt["travel_time_hours"],
                departure_hub=opt["departure_hub"],
                arrival_hub=opt["arrival_hub"],
                source=opt.get("source", "Indian Transit Matrix"),
                confidence=opt.get("confidence", "HIGH")
            ))

        # Select preferred mode
        selected = options[0]
        if "cheap" in pref:
            # Pick train or bus
            train_or_bus = [o for o in options if o.mode in ("Train", "Bus")]
            if train_or_bus:
                selected = min(train_or_bus, key=lambda x: x.estimated_fare_per_person)
        elif "fast" in pref:
            # Pick flight
            flights = [o for o in options if o.mode == "Flight"]
            if flights:
                selected = flights[0]
        elif "comfort" in pref:
            # Pick flight or high-tier train
            comfort_opts = [o for o in options if o.mode in ("Flight", "Cab")]
            if comfort_opts:
                selected = comfort_opts[0]
        else: # Balanced
            trains = [o for o in options if o.mode == "Train"]
            if trains:
                selected = trains[0]
            else:
                selected = options[0]

        # Calculate local transit daily estimate
        if "goa" in intake.destination.lower():
            local_daily = 600.0 # Rental scooter / auto
            local_mode = "Rental Scooter / Goamiles Cabs"
        elif any(c in intake.destination.lower() for c in ("hyderabad", "delhi", "mumbai", "bengaluru")):
            local_daily = 500.0 # Metro & Auto Rickshaws
            local_mode = "Metro Rail & Auto-rickshaws"
        else:
            local_daily = 550.0
            local_mode = "Auto-rickshaws & Local Cabs"

        total_local = local_daily * duration
        total_transport_budget = selected.total_fare + total_local

        reasoning = (
            f"Selected {selected.mode} ({selected.operator_or_type}) based on your '{intake.transport_pref}' preference. "
            f"Local transit budgeted at ₹{intake.duration_days * local_daily:.0f} for {duration} days ({local_mode})."
        )

        return TransportResult(
            origin=intake.origin_city,
            destination=intake.destination,
            distance_km=650.0,
            intercity_options=options,
            selected_option=selected,
            local_transport_mode=local_mode,
            local_transport_daily_estimate=local_daily,
            total_transport_budget=total_transport_budget,
            reasoning=reasoning
        )

transport_agent = TransportAgent()
