import React, { useEffect, useState } from 'react';
import {
  Sparkles, Plus, Heart, Download, Trash2, Copy,
  Calendar, Users, MapPin, DollarSign, ArrowRight,
  ShieldCheck, Loader2, Compass
} from 'lucide-react';
import { Trip, DestinationCard } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onSelectTrip: (tripId: string) => void;
  destinations: DestinationCard[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectTrip,
  destinations,
}) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await api.trips.getUserTrips();
      setTrips(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleToggleFavorite = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.trips.toggleFavorite(tripId);
      setTrips(trips.map(t => t.id === tripId ? { ...t, is_favorite: !t.is_favorite } : t));
    } catch (err: any) {
      alert(`Error toggling favorite: ${err.message}`);
    }
  };

  const handleDuplicate = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const cloned = await api.trips.duplicateTrip(tripId);
      setTrips([cloned, ...trips]);
    } catch (err: any) {
      alert(`Error duplicating: ${err.message}`);
    }
  };

  const handleDelete = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this trip plan?')) return;
    try {
      await api.trips.deleteTrip(tripId);
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  const totalPlannedBudget = trips.reduce(
    (sum, t) => sum + (t.budget_breakdown?.predicted_total || 0),
    0
  );
  const favoriteTripsCount = trips.filter(t => t.is_favorite).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      
      {/* Welcome Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-200 dark:border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Travel Dashboard</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            Welcome back, {user?.full_name || 'Traveler'}!
          </h2>
          <p className="text-xs text-slate-300">
            Manage your verified Indian itineraries, download reports, or plan your next adventure.
          </p>
        </div>

        <button
          onClick={() => onNavigate('plan')}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Plan a New Trip</span>
        </button>
      </div>

      {/* Visual Stats Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Trips Planned</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">{trips.length}</span>
          <span className="text-[11px] text-emerald-500 font-semibold">Active Itineraries</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Country Scope</span>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">India Only</span>
          </div>
          <span className="text-[11px] text-amber-500 font-semibold">28 States & 8 UTs</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Favorites</span>
          <span className="text-2xl font-black text-rose-500 block">{favoriteTripsCount}</span>
          <span className="text-[11px] text-slate-400 font-semibold">Saved for quick access</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Planned Budget</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
            ₹{totalPlannedBudget.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-cyan-500 font-semibold">Verified Total</span>
        </div>
      </div>

      {/* Saved Trips List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Your Saved Trips
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any trip to open its full plan, view the map, or optimize the budget.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            <span>Loading your journeys...</span>
          </div>
        ) : trips.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">No trips planned yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Let our multi-agent AI create your first personalized India journey in seconds.
              </p>
            </div>
            <button
              onClick={() => onNavigate('plan')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
            >
              Plan Your First Trip ✨
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => {
              const totalCost = trip.budget_breakdown?.predicted_total || 0;
              return (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip(trip.id)}
                  className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-md hover:shadow-xl hover:border-emerald-500/50 cursor-pointer transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{trip.origin_city} ➔ {trip.destination}</span>
                      </div>
                      <button
                        onClick={(e) => handleToggleFavorite(trip.id, e)}
                        className={`p-1.5 rounded-full transition-colors ${
                          trip.is_favorite
                            ? 'text-rose-500 bg-rose-500/10'
                            : 'text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <h4 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {trip.title}
                    </h4>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Calendar className="w-3 h-3 text-emerald-500" />
                        <span>{trip.duration_days} Days</span>
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Users className="w-3 h-3 text-amber-500" />
                        <span>{trip.travelers_count} Travelers</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium">
                        {trip.travel_style}
                      </span>
                    </div>

                    <div className="pt-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        AI Predicted Total
                      </span>
                      <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{totalCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <a
                      href={api.trips.getPdfDownloadUrl(trip.id)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        title="Duplicate Trip"
                        onClick={(e) => handleDuplicate(trip.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete Trip"
                        onClick={(e) => handleDelete(trip.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
