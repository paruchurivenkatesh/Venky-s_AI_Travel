import React, { useEffect, useRef, useState } from 'react';
import { Trip, Hotel, Activity } from '../types';
import L from 'leaflet';

interface InteractiveMapProps {
  trip: Trip;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ trip }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 = All days

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center from destination or Hyderabad
    const defaultLat = trip.destination_details?.latitude || 15.2993;
    const defaultLng = trip.destination_details?.longitude || 74.1240;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 12);
    mapInstanceRef.current = map;

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Venky\'s AI Travel Grounding',
      maxZoom: 18,
    }).addTo(map);

    // Custom Icon Maker
    const createCustomIcon = (bgColor: string, text: string) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${bgColor};
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 13px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            ${text}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    const markers: L.Marker[] = [];
    const routeCoords: [number, number][] = [];

    // 1. Add Hotel marker
    const selectedHotel = trip.hotels.find(h => h.is_selected) || trip.hotels[0];
    if (selectedHotel && selectedHotel.latitude && selectedHotel.longitude) {
      const hotelMarker = L.marker([selectedHotel.latitude, selectedHotel.longitude], {
        icon: createCustomIcon('#6366f1', '🏨'),
      }).addTo(map);

      hotelMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #1e293b;">
            ${selectedHotel.name}
          </h4>
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            ${selectedHotel.category} · ₹${selectedHotel.price_per_night.toLocaleString('en-IN')}/night
          </p>
          <span style="display: inline-block; margin-top: 6px; padding: 2px 6px; background: #e0e7ff; color: #4338ca; border-radius: 4px; font-size: 10px; font-weight: bold;">
            Selected Stay
          </span>
        </div>
      `);
      markers.push(hotelMarker);
    }

    // 2. Add Itinerary activities markers & polyline
    const daysToRender = selectedDay === 0
      ? trip.itinerary_days
      : trip.itinerary_days.filter(d => d.day_number === selectedDay);

    let stepCount = 1;
    daysToRender.forEach((day) => {
      day.activities.forEach((act) => {
        if (act.latitude && act.longitude) {
          const coord: [number, number] = [act.latitude, act.longitude];
          routeCoords.push(coord);

          const isMorning = act.time_slot === 'Morning';
          const isAfternoon = act.time_slot === 'Afternoon';
          const pinColor = isMorning ? '#f59e0b' : isAfternoon ? '#10b981' : '#ec4899';

          const marker = L.marker(coord, {
            icon: createCustomIcon(pinColor, `${stepCount}`),
          }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: inherit; padding: 4px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${pinColor};">
                Day ${day.day_number} · ${act.time_slot}
              </span>
              <h4 style="margin: 2px 0 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">
                ${act.activity_title}
              </h4>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                ${act.location_name}
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 600; color: #059669;">
                ${act.estimated_cost > 0 ? `Entry Fee: ₹${act.estimated_cost}` : 'Free Entry'}
              </p>
            </div>
          `);

          markers.push(marker);
          stepCount++;
        }
      });
    });

    // 3. Draw Connecting Route Line
    if (routeCoords.length > 1) {
      L.polyline(routeCoords, {
        color: '#10b981',
        weight: 3.5,
        opacity: 0.75,
        dashArray: '6, 8',
      }).addTo(map);
    }

    // Fit map bounds to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trip, selectedDay]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
      {/* Route Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white">
            Geographic Travel Map & Routes
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click pins to inspect entry fees, time slots, and travel clusters.
          </p>
        </div>

        {/* Day Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDay === 0
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Route
          </button>
          {trip.itinerary_days.map((d) => (
            <button
              key={d.day_number}
              onClick={() => setSelectedDay(d.day_number)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedDay === d.day_number
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Day {d.day_number}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-[450px] md:h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 z-10"
      />

      {/* Legend Chips */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-500" />
          <span>Hotel Stay</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Morning Slot</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Afternoon Slot</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-pink-500" />
          <span>Evening Slot</span>
        </span>
        <span className="flex items-center gap-1.5 text-emerald-500 font-bold ml-auto">
          <span>- - - Verified Route Line</span>
        </span>
      </div>
    </div>
  );
};
