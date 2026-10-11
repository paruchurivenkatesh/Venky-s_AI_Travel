import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, Bot, MapPin, Bus, Hotel, Wallet, Calendar, ShieldCheck } from 'lucide-react';

interface PlanningAnimationProps {
  currentStage?: string;
  progressPercent?: number;
}

const STAGES = [
  { id: 1, label: 'Understanding your preferences', agent: 'Trip Intake Agent', icon: Bot },
  { id: 2, label: 'Researching destination & cultural highlights', agent: 'Destination Agent', icon: MapPin },
  { id: 3, label: 'Analyzing transportation options & fares', agent: 'Transportation Agent', icon: Bus },
  { id: 4, label: 'Finding verified accommodation & stays', agent: 'Accommodation Agent', icon: Hotel },
  { id: 5, label: 'Predicting your budget with deterministic engine', agent: 'Budget Prediction Agent', icon: Wallet },
  { id: 6, label: 'Optimizing geographic routes & POI clusters', agent: 'Route Agent', icon: MapPin },
  { id: 7, label: 'Generating balanced day-by-day itinerary', agent: 'Itinerary Agent', icon: Calendar },
  { id: 8, label: 'Running 12-point quality & arithmetic verification', agent: 'Verification Agent', icon: ShieldCheck },
];

export const PlanningAnimation: React.FC<PlanningAnimationProps> = ({ currentStage, progressPercent }) => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    // Smooth auto-advancement for visual feedback if backend streams
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < STAGES.length ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[550px] flex flex-col items-center justify-center p-6 text-center">
      {/* Brand Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 animate-pulse">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Multi-Agent Coordination Pipeline Active</span>
      </div>

      <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
        Venky's AI is planning your journey...
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mb-8">
        Specialized autonomous agents are collaborating to query Indian datasets, predict realistic costs, and craft your personalized itinerary.
      </p>

      {/* Graphical Multi-Agent Node Architecture */}
      <div className="w-full max-w-xl bg-slate-100 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
            VENKY'S AI MULTI-AGENT ORCHESTRATOR
          </span>
        </div>

        {/* Status Stages Checklist */}
        <div className="space-y-3 text-left">
          {STAGES.map((s, idx) => {
            const isCompleted = activeStep > s.id;
            const isCurrent = activeStep === s.id;
            const Icon = s.icon;

            return (
              <div
                key={s.id}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 translate-x-1'
                    : isCompleted
                    ? 'text-slate-700 dark:text-slate-300 opacity-90'
                    : 'text-slate-400 dark:text-slate-600 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-slate-700 shrink-0" />
                  )}
                  <span className="text-xs md:text-sm font-medium">{s.label}</span>
                </div>

                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                  {s.agent}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md space-y-2">
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, Math.max(15, (activeStep / STAGES.length) * 100))}%` }}
          />
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {Math.round((activeStep / STAGES.length) * 100)}% Completed · Verified Grounding
        </p>
      </div>
    </div>
  );
};
