import React, { useState } from 'react';
import { Compass, MapPin, Search, Sparkles, ArrowRight, Filter } from 'lucide-react';
import { DestinationCard } from '../types';

interface DestinationsPageProps {
  destinations: DestinationCard[];
  onStartPlanning: (dest?: string) => void;
}

export const DestinationsPage: React.FC<DestinationsPageProps> = ({
  destinations,
  onStartPlanning,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');

  const regions = ['All', 'South', 'North', 'West', 'East', 'North-East', 'Island'];
  const tags = ['All', 'Beaches', 'Mountains', 'Heritage', 'Food', 'Adventure', 'Spiritual', 'Couple'];

  const filtered = destinations.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                        d.state.toLowerCase().includes(search.toLowerCase()) ||
                        d.short_description.toLowerCase().includes(search.toLowerCase());
    const matchRegion = selectedRegion === 'All' || d.region.toLowerCase() === selectedRegion.toLowerCase();
    const matchTag = selectedTag === 'All' || d.travel_styles.some(s => s.toLowerCase() === selectedTag.toLowerCase());
    return matchSearch && matchRegion && matchTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/20">
          <Compass className="w-3.5 h-3.5" />
          <span>Explore Incredible India</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Explore Indian Travel Destinations
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Discover verified travel hubs across 28 states and 8 union territories, complete with grounded stay rates, local delicacies, and optimal travel durations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search destination, state, or experience..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs md:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Region & Tag filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Region:</span>
            </span>
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedRegion === r
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Tag Pill Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 mr-1">Style:</span>
            {tags.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedTag === t
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(d => (
          <div
            key={d.id}
            onClick={() => onStartPlanning(d.name)}
            className="group rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm hover:shadow-xl hover:border-emerald-500/50 cursor-pointer transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 overflow-hidden">
                <img
                  src={d.image_url}
                  alt={d.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                  {d.ai_badge}
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-xs font-extrabold text-white">
                  ~₹{d.typical_budget_per_day.toLocaleString('en-IN')}/day
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{d.state} ({d.region})</span>
                </div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {d.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {d.short_description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {d.travel_styles.slice(0, 3).map((st, i) => (
                    <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">
                Ideal: <strong className="text-slate-700 dark:text-slate-200">{d.recommended_days} Days</strong>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Plan Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
