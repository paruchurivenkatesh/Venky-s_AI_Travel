import React from 'react';
import { Sparkles, Shield, MapPin, Database, Award, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                VENKY'S AI TRAVEL
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              India's first specialized Generative AI Multi-Agent Travel Planner. Combining autonomous agent research, grounded government datasets, and deterministic budget math.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Strictly India-Only Destinations</span>
            </div>
          </div>

          {/* Col 2: Multi-Agent Network */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Autonomous AI Agents
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>• Trip Intake & Geo Validator</li>
              <li>• Destination Research Agent</li>
              <li>• Multi-Modal Transit Agent</li>
              <li>• Accommodation Agent</li>
              <li>• Places & Google POI Agent</li>
              <li>• AI Budget Prediction Engine</li>
              <li>• Route Optimization Agent</li>
              <li>• 12-Point Verification Agent</li>
            </ul>
          </div>

          {/* Col 3: Data Grounding Partners */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Data Grounding Layers
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>• Koson India Hotel API Directory</li>
              <li>• Google Maps & Places Grounding</li>
              <li>• Indian Data Project Open Data</li>
              <li>• Data.gov.in Tourism Statistics</li>
              <li>• Ministry of Tourism Advisories</li>
              <li>• Indian Railways & State RTC Baselines</li>
            </ul>
          </div>

          {/* Col 4: Coverage */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Nationwide Coverage
            </h4>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Comprehensive routing across all 28 Indian States and 8 Union Territories from Kashmir to Kanyakumari, Goa to Arunachal Pradesh.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>GenAI Internship Flagship</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p className="max-w-3xl leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-400">Transparency Disclosure:</strong> Travel prices, hotel availability, transportation fares, and attraction entry fees can fluctuate seasonally. Venky's AI Travel generates grounded predictive estimations and should not be treated as a guaranteed commercial booking quote. Always verify real-time schedules prior to departure.
          </p>
          <p className="shrink-0">
            © {new Date().getFullYear()} Venky's AI Travel. Made for Incredible India.
          </p>
        </div>

      </div>
    </footer>
  );
};
