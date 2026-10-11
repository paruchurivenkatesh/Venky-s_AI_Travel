import React, { useState } from 'react';
import {
  MapPin, Calendar, Users, DollarSign, Compass,
  Sparkles, Hotel, Bus, Languages, ArrowRight, ArrowLeft,
  Check, AlertTriangle
} from 'lucide-react';
import { DestinationCard } from '../types';

interface MultiStepPlannerProps {
  destinations: DestinationCard[];
  onSubmit: (formData: any) => void;
  loading: boolean;
}

export const MultiStepPlanner: React.FC<MultiStepPlannerProps> = ({
  destinations,
  onSubmit,
  loading,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [originCity, setOriginCity] = useState('Hyderabad');
  const [destination, setDestination] = useState('Goa');
  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [durationDays, setDurationDays] = useState(4);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [budgetMode, setBudgetMode] = useState('Standard');
  const [budgetAmount, setBudgetAmount] = useState<number>(25000);
  const [travelStyle, setTravelStyle] = useState('Friends');
  const [accommodationPref, setAccommodationPref] = useState('3 Star');
  const [transportPref, setTransportPref] = useState('Balanced');
  const [interests, setInterests] = useState<string[]>(['Beaches', 'Food', 'Culture']);
  const [language, setLanguage] = useState('English');

  // Popular origin hubs
  const popularOrigins = ['Hyderabad', 'Bengaluru', 'Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Pune'];

  // Step 2 destination validation
  const validateDestinationInput = (val: string) => {
    setDestination(val);
    const foreignKeywords = ['paris', 'dubai', 'london', 'singapore', 'bali', 'bangkok', 'new york', 'maldives', 'tokyo'];
    const isForeign = foreignKeywords.some(k => val.toLowerCase().includes(k));
    if (isForeign) {
      setDestinationError(`'${val}' is outside India! Venky's AI Travel is an India-only travel planner.`);
    } else {
      setDestinationError(null);
    }
  };

  const toggleInterest = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter(i => i !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  const handleNext = () => {
    if (currentStep === 2 && destinationError) return;
    if (currentStep < 10) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleFinalSubmit = () => {
    onSubmit({
      origin_city: originCity,
      destination,
      duration_days: durationDays,
      adults_count: adultsCount,
      children_count: childrenCount,
      budget_mode: budgetMode,
      budget_amount: budgetAmount,
      travel_style: travelStyle,
      accommodation_pref: accommodationPref,
      transport_pref: transportPref,
      interests,
      language,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
      
      {/* Progress Stepper Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          <span>Step {currentStep} of 10</span>
          <span className="text-emerald-500">{Math.round((currentStep / 10) * 100)}% Complete</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Starting City */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Step 01</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Where are you starting from?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your origin city in India for accurate flight, train, or road route calculation.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Origin City:
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              <input
                type="text"
                value={originCity}
                onChange={e => setOriginCity(e.target.value)}
                placeholder="e.g. Hyderabad, Secunderabad, Bengaluru"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Popular Starting Hubs:
            </p>
            <div className="flex flex-wrap gap-2">
              {popularOrigins.map(hub => (
                <button
                  key={hub}
                  type="button"
                  onClick={() => setOriginCity(hub)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    originCity === hub
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {hub}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Destination */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Step 02</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Where do you want to go in India?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore 28 States & 8 Union Territories. Foreign queries will be rejected gracefully.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Indian Destination:
            </label>
            <div className="relative">
              <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
              <input
                type="text"
                value={destination}
                onChange={e => validateDestinationInput(e.target.value)}
                placeholder="e.g. Goa, Manali, Munnar, Kashmir, Jaipur"
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border ${
                  destinationError
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'
                } bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold`}
              />
            </div>
            {destinationError && (
              <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{destinationError}</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Featured Top Picks:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['Goa', 'Hyderabad', 'Jaipur', 'Munnar', 'Manali', 'Kashmir', 'Udaipur', 'Meghalaya'].map(dest => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => validateDestinationInput(dest)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    destination === dest
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Duration / Days */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Step 03</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              How many days are you planning?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trip duration determines stay nights ({Math.max(1, durationDays - 1)} Nights) and daily activities.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <span className="text-5xl font-black text-emerald-600 dark:text-emerald-400">
              {durationDays} Days
            </span>
            <span className="block text-xs font-bold text-slate-400 uppercase">
              {Math.max(1, durationDays - 1)} Nights Stay in {destination}
            </span>

            <input
              type="range"
              min={1}
              max={14}
              value={durationDays}
              onChange={e => setDurationDays(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex justify-center gap-2">
            {[2, 3, 4, 5, 7, 10].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDurationDays(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  durationDays === d
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Travelers */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Step 04</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Who is traveling with you?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fares and stay room configurations scale deterministically with traveler count.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Adults */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Adults</h4>
                <p className="text-xs text-slate-400">Age 12+ years</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                  className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 font-black text-lg"
                >
                  -
                </button>
                <span className="font-extrabold text-base w-4 text-center">{adultsCount}</span>
                <button
                  type="button"
                  onClick={() => setAdultsCount(adultsCount + 1)}
                  className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Children</h4>
                <p className="text-xs text-slate-400">Below 12 years</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                  className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 font-black text-lg"
                >
                  -
                </button>
                <span className="font-extrabold text-base w-4 text-center">{childrenCount}</span>
                <button
                  type="button"
                  onClick={() => setChildrenCount(childrenCount + 1)}
                  className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Budget Preference */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Step 05</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Select Your Budget Preference
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our AI Budget Agent predicts costs independently, but uses this baseline tier for suggestions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'Budget', label: '💰 Budget Traveler', desc: 'Hostels, AC Sleeper train, authentic street thalis' },
              { id: 'Standard', label: '⚖️ Standard Traveler', desc: '3-Star hotels, Express rail/cab, popular dining' },
              { id: 'Premium', label: '👑 Premium Traveler', desc: '4/5-Star luxury resorts, direct flights, fine dining' },
            ].map(b => (
              <div
                key={b.id}
                onClick={() => setBudgetMode(b.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  budgetMode === b.id
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
                  {b.label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Target Budget (INR) - Optional:
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={budgetAmount}
                onChange={e => setBudgetAmount(Number(e.target.value))}
                step={1000}
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Travel Style */}
      {currentStep === 6 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Step 06</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              What is your travel style?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Helps our Itinerary Agent set pace and experience clustering.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Friends', 'Couple', 'Family', 'Solo', 'Backpacker', 'Relaxed', 'Adventure', 'Photography'].map(style => (
              <button
                key={style}
                type="button"
                onClick={() => setTravelStyle(style)}
                className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all ${
                  travelStyle === style
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 7: Interests */}
      {currentStep === 7 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Step 07</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Select your travel interests
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select multiple tags to personalize attractions and experiences.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'Beaches', label: '🏖️ Beaches & Coasts' },
              { id: 'Mountains', label: '🏔️ Mountains & Mist' },
              { id: 'Food', label: '🍛 Culinary & Street Food' },
              { id: 'Culture', label: '🏛️ Heritage & Architecture' },
              { id: 'Spiritual', label: '🧘 Spiritual & Ghats' },
              { id: 'Adventure', label: '🪂 Adventure & Water Sports' },
              { id: 'Nature', label: '🌲 Nature & Waterfalls' },
              { id: 'Photography', label: '📸 Scenic Viewpoints' },
              { id: 'Shopping', label: '🛍️ Bazaars & Handicrafts' },
            ].map(item => {
              const selected = interests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                    selected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {selected && <Check className="w-4 h-4 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 8: Stay Preference */}
      {currentStep === 8 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Step 08</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Accommodation Preference
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Matched against Koson India Hotel API grounded listings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'Hostel', label: 'Boutique Hostel', rate: '~₹700 - ₹950/night' },
              { id: 'Budget', label: 'Budget Hotel / Homestay', rate: '~₹1,800 - ₹2,400/night' },
              { id: '3 Star', label: '3-Star Hotel', rate: '~₹3,200 - ₹4,200/night' },
              { id: '4 Star', label: '4-Star Premium', rate: '~₹5,500 - ₹8,000/night' },
              { id: '5 Star', label: '5-Star Heritage / Luxury', rate: '~₹14,000+/night' },
            ].map(h => (
              <div
                key={h.id}
                onClick={() => setAccommodationPref(h.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  accommodationPref === h.id
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Hotel className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{h.label}</h4>
                </div>
                <span className="text-xs font-semibold text-slate-400">{h.rate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 9: Transportation Mode */}
      {currentStep === 9 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Step 09</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Preferred Transportation Strategy
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose how you prioritize transit budget versus travel hours.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'Cheapest', label: '💰 Cheapest', desc: 'Indian Railways Sleeper or State RTC Express' },
              { id: 'Balanced', label: '⚖️ Balanced', desc: 'AC 3-Tier Train or Multi-Axle Volvo' },
              { id: 'Fastest', label: '⚡ Fastest', desc: 'Direct Domestic Air Flight' },
              { id: 'Comfortable', label: '✨ Comfortable', desc: 'Flight or Dedicated AC Cab' },
            ].map(t => (
              <div
                key={t.id}
                onClick={() => setTransportPref(t.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  transportPref === t.id
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{t.label}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 10: Language & Final Confirmation */}
      {currentStep === 10 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-emerald-500 text-xs font-extrabold uppercase tracking-widest">Step 10</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Presentation Language
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generates travel advice and greetings in your preferred Indian language.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              'English', 'Hindi', 'Telugu', 'Tamil',
              'Kannada', 'Malayalam', 'Bengali', 'Marathi'
            ].map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`p-3 rounded-2xl border font-bold text-xs transition-all ${
                  language === lang
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Quick Summary Pill */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Trip Summary Preview:</span>
            <p>• {originCity} ➔ {destination} ({durationDays} Days, {adultsCount + childrenCount} Travelers)</p>
            <p>• Mode: {transportPref} · Stay: {accommodationPref} · Style: {travelStyle}</p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : <div />}

        {currentStep < 10 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={currentStep === 2 && Boolean(destinationError)}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all ml-auto"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-cyan-600 hover:from-amber-600 hover:to-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition-all ml-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Plan My Trip ✨</span>
          </button>
        )}
      </div>

    </div>
  );
};
