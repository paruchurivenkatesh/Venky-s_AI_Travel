import React, { useState } from 'react';
import {
  Sparkles, Compass, ShieldCheck, ArrowRight, MapPin,
  TrendingUp, Calendar, Users, Award, Search, CheckCircle2,
  ChevronRight, Hotel, Bus, Utensils
} from 'lucide-react';
import { DestinationCard, RecommendationItem } from '../types';
import { api } from '../services/api';

interface LandingPageProps {
  destinations: DestinationCard[];
  onStartPlanning: (dest?: string) => void;
  onExplore: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  destinations,
  onStartPlanning,
  onExplore,
}) => {
  const [smartQuery, setSmartQuery] = useState('I have ₹15,000 and 4 days from Hyderabad');
  const [recommending, setRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationItem[] | null>(null);

  const handleSmartSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!smartQuery.trim()) return;

    setRecommending(true);
    try {
      const res = await api.destinations.recommend({ query: smartQuery });
      setRecommendations(res.recommendations);
    } catch (err: any) {
      alert(`Search error: ${err.message}`);
    } finally {
      setRecommending(false);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>India's Dedicated Multi-Agent AI Travel Planner</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Plan Your Perfect <br />
              <span className="bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                India Trip
              </span>{' '}
              with AI
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Multiple specialized AI agents research destinations, predict your travel budget, optimize your day-by-day itinerary, and verify realistic expenses across all 28 Indian States & 8 Union Territories.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onStartPlanning()}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-cyan-600 hover:from-amber-600 hover:to-emerald-700 text-white font-extrabold text-base shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-[1.02] transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>Plan My Trip</span>
              </button>

              <button
                onClick={onExplore}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-base hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 transition-all"
              >
                <Compass className="w-5 h-5 text-emerald-500" />
                <span>Explore India</span>
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Deterministic Budget Math</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Strictly India-Only Destinations</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Downloadable Travel PDF</span>
              </span>
            </div>
          </div>

          {/* Right Hero: Graphical Travel Visualization with Floating Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 group">
              <img
                src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
                alt="Incredible India Travel"
                className="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-left text-white">
                <span className="px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-widest text-white inline-block mb-2">
                  Featured AI Journey
                </span>
                <h3 className="text-2xl font-black text-white">Goa & Konkan Coastal Route</h3>
                <p className="text-xs text-slate-300">4 Days · 2 Travelers · Verified Budget ₹28,450</p>
              </div>
            </div>

            {/* Floating Card 1: Budget Readout */}
            <div className="absolute -top-4 -left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-pulse-subtle">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                ₹
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Predicted Budget</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">₹18,500</span>
              </div>
            </div>

            {/* Floating Card 2: Duration */}
            <div className="absolute top-1/2 -right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Recommended</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">4 Days / 3 Nights</span>
              </div>
            </div>

            {/* Floating Card 3: Confidence */}
            <div className="absolute -bottom-6 -left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Verification Score</span>
                <span className="text-sm font-extrabold text-emerald-500">92% High Confidence</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SMART DESTINATION RECOMMENDER ("Where should I go?") */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-emerald-500/30 text-white shadow-2xl space-y-6 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Destination Recommender</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                "Where should I go?"
              </h3>
              <p className="text-xs text-slate-300">
                Ask with your city, budget, or days, and our AI will recommend ideal Indian destinations.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSmartSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={smartQuery}
                onChange={e => setSmartQuery(e.target.value)}
                placeholder="e.g. I have ₹15,000 and 4 days from Hyderabad"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={recommending}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 font-extrabold text-sm shadow-lg disabled:opacity-50 shrink-0"
            >
              {recommending ? 'Analyzing India Routes...' : 'Recommend Destintions'}
            </button>
          </form>

          {/* Recommendations Result Grid */}
          {recommendations && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              {recommendations.map((r, idx) => (
                <div
                  key={idx}
                  onClick={() => onStartPlanning(r.destination)}
                  className="group p-4 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition-all space-y-3"
                >
                  <div className="relative h-32 rounded-xl overflow-hidden">
                    <img
                      src={r.image_url}
                      alt={r.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-emerald-400">
                      ₹{r.estimated_budget.toLocaleString('en-IN')} Est.
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-colors">
                      {r.destination}
                    </h4>
                    <p className="text-[11px] text-slate-400">{r.state} · {r.suggested_days} Days</p>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1">{r.why_it_fits}</p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-emerald-400 pt-1">
                    <span>Plan this trip</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. EXPLORE FAMOUS INDIAN DESTINATIONS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Incredible India</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              Popular Indian Destinations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grounded data, authentic coordinates, and hotel listings across key Indian hubs.
            </p>
          </div>
          <button
            onClick={onExplore}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>View All Destinations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.slice(0, 8).map(d => (
            <div
              key={d.id}
              onClick={() => onStartPlanning(d.name)}
              className="group rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-md hover:shadow-xl hover:border-emerald-500/50 cursor-pointer transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={d.image_url}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                  {d.ai_badge}
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-xs font-extrabold text-white">
                  ~₹{d.typical_budget_per_day.toLocaleString('en-IN')}/day
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{d.state}</span>
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {d.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {d.short_description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    Best: <strong className="text-slate-700 dark:text-slate-300">{d.best_season.split('(')[0]}</strong>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {d.recommended_days} Days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TRUST & TRANSPARENCY: "How We Calculate Your Budget" */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-8 text-left">
          <div>
            <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">Transparency By Design</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              How We Calculate Your Travel Budget
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Unlike chatbots that invent travel numbers, Venky's AI Travel enforces a strict 5-stage data grounding and deterministic mathematical pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { num: '01', title: 'Data Grounding', desc: 'Query Koson India Hotel API, Indian Railways matrices, and open datasets.' },
              { num: '02', title: 'Agent Research', desc: 'Specialized agents compute passenger counts, nights, and transit options.' },
              { num: '03', title: 'Deterministic Math', desc: 'Backend calculation engine validates totals: Component sum == Total.' },
              { num: '04', title: '12-Point Audit', desc: 'Verification agent audits stay nights, impossible routes, and price sanity.' },
              { num: '05', title: 'Honest Disclosure', desc: 'Prices clearly labeled as API GROUNDED, AI PREDICTED, or ESTIMATED.' },
            ].map(step => (
              <div key={step.num} className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-2xl font-black text-emerald-500">{step.num}</span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300">
            <strong className="font-bold">Transparent Planning Policy:</strong> Travel prices, fuel surcharges, hotel availability, and attraction entry fees can fluctuate. Venky's AI Travel provides predictive estimates and should not be treated as a guaranteed commercial booking quote.
          </div>
        </div>
      </section>

      {/* 5. MULTI-AGENT ARCHITECTURE HIGHLIGHTS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left">
        <div>
          <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Autonomous Pipeline</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Engineered for Production AI Evaluation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A genuine multi-agent architecture built for GenAI internship rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Parallel Agent Research</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Transport, Accommodation, Places/POI, and Tourism Data agents execute concurrently via async worker pools, dramatically speeding response times while fetching authentic grounded datasets.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Dynamic Budget Optimization</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Click 'Reduce My Budget' or 'Fit My Budget' to trigger autonomous re-evaluation across stay tiers, route combinations, and attraction fees, giving users exact savings deltas.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Professional PDF Travel Reports</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generate downloadable, high-resolution PDF itineraries featuring budget tables, day-by-day Morning/Afternoon/Evening schedules, and authentic food guides formatted in Indian Rupee standards.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
