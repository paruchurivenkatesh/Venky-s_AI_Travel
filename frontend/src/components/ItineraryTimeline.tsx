import React, { useState } from 'react';
import { ItineraryDay } from '../types';
import { Sun, Sunset, Moon, MapPin, Clock, DollarSign, Utensils, Navigation, ChevronDown, ChevronUp } from 'lucide-react';

interface ItineraryTimelineProps {
  days: ItineraryDay[];
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ days }) => {
  const [expandedDay, setExpandedDay] = useState<number>(1);

  if (!days || days.length === 0) {
    return <p className="text-sm text-slate-500">No itinerary days generated yet.</p>;
  }

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const isExpanded = expandedDay === day.day_number;

        return (
          <div
            key={day.day_number}
            className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {/* Header Accordion */}
            <div
              onClick={() => setExpandedDay(isExpanded ? 0 : day.day_number)}
              className="flex items-center justify-between p-5 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex flex-col items-center justify-center font-bold shadow-md shadow-emerald-500/10">
                  <span className="text-[10px] uppercase tracking-wider">Day</span>
                  <span className="text-lg leading-none">{day.day_number}</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white">
                    {day.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Theme: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{day.theme || 'Exploration'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800">
                    ₹{day.daily_estimated_cost.toLocaleString('en-IN')}/day
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800">
                    ~{day.daily_distance_km} km
                  </span>
                </div>
                <div className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {/* Expanded Day Timeline */}
            {isExpanded && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800/60 space-y-6">
                
                {/* Vertical slots: Morning, Afternoon, Evening */}
                <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-emerald-500 before:to-indigo-500">
                  
                  {day.activities.map((act, aIdx) => {
                    const isMorning = act.time_slot === 'Morning';
                    const isAfternoon = act.time_slot === 'Afternoon';
                    const IconSlot = isMorning ? Sun : isAfternoon ? Sunset : Moon;
                    const badgeColor = isMorning
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : isAfternoon
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';

                    return (
                      <div key={act.id || aIdx} className="relative group">
                        {/* Timeline Node Point */}
                        <div className="absolute -left-[30px] top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                        </div>

                        <div className="bg-slate-50/60 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeColor}`}>
                                <IconSlot className="w-3 h-3" />
                                {act.time_slot}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {act.approx_time || '09:00 AM - 12:00 PM'}
                              </span>
                            </div>

                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-emerald-500" />
                              {act.estimated_cost > 0 ? `Entry: ₹${act.estimated_cost}` : 'Free Entry'}
                            </span>
                          </div>

                          <h5 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                            {act.activity_title}
                          </h5>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{act.location_name}</span>
                            <span className="mx-1">·</span>
                            <Navigation className="w-3 h-3 text-cyan-500 shrink-0" />
                            <span>~{act.travel_time_mins} mins commute</span>
                          </div>

                          {act.description && (
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                              {act.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Culinary Highlights for Day */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {day.lunch_recommendation && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-1">
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Recommended Lunch</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{day.lunch_recommendation}</p>
                    </div>
                  )}

                  {day.dinner_recommendation && (
                    <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Recommended Dinner</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{day.dinner_recommendation}</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
