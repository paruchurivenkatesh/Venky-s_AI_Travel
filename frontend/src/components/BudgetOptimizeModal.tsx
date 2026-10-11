import React, { useState } from 'react';
import { X, Sparkles, TrendingDown, CheckCircle2, AlertCircle, ArrowRight, Loader2, DollarSign } from 'lucide-react';
import { api } from '../services/api';
import { Trip } from '../types';

interface BudgetOptimizeModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTrip: Trip) => void;
}

export const BudgetOptimizeModal: React.FC<BudgetOptimizeModalProps> = ({
  trip,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'reduce' | 'fit'>('reduce');
  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [targetBudget, setTargetBudget] = useState<number>(
    Math.round((trip.budget_breakdown?.predicted_total || 25000) * 0.8)
  );
  const [fitResult, setFitResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleReduceBudget = async () => {
    setLoading(true);
    try {
      const res = await api.trips.optimizeBudget(trip.id, 'reduce');
      setOptimizationResult(res);
      // Fetch fresh trip
      const updated = await api.trips.getTripById(trip.id);
      onSuccess(updated);
    } catch (err: any) {
      alert(`Optimization error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFitBudget = async () => {
    setLoading(true);
    try {
      const res = await api.trips.fitBudget(trip.id, targetBudget);
      setFitResult(res);
    } catch (err: any) {
      alert(`Fit budget error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentTotal = trip.budget_breakdown?.predicted_total || 25000;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Intelligent Budget Optimizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Venky's AI will re-analyze components without compromising your experience.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('reduce')}
            className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'reduce'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            💡 Reduce My Budget
          </button>
          <button
            onClick={() => setActiveTab('fit')}
            className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'fit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            🎯 Fit My Budget
          </button>
        </div>

        {/* Tab 1: Reduce My Budget */}
        {activeTab === 'reduce' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Automated Smart Savings Engine</p>
                <p className="mt-0.5 opacity-90">
                  Our Accommodation & Transport agents will substitute high-tariff items with top-rated budget alternatives, while maintaining high safety and cleanliness standards.
                </p>
              </div>
            </div>

            {optimizationResult ? (
              <div className="space-y-4">
                {/* Before / After Stats */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase">Original</span>
                    <span className="text-base font-bold text-slate-700 dark:text-slate-300 line-through">
                      ₹{optimizationResult.current_budget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-emerald-500 uppercase">Optimized</span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{optimizationResult.optimized_budget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-amber-500 uppercase">You Save</span>
                    <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                      ₹{optimizationResult.savings_amount.toLocaleString('en-IN')} ({optimizationResult.savings_percentage}%)
                    </span>
                  </div>
                </div>

                {/* Savings Breakdown List */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    How Savings Were Achieved:
                  </h5>
                  <div className="space-y-2">
                    {optimizationResult.breakdown.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.category}:</span>
                          <span className="text-slate-500 dark:text-slate-400 ml-1.5">{item.action}</span>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          -₹{item.savings.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  Apply & Keep Optimized Plan
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-center">
                  <span className="block text-xs font-bold text-slate-400 uppercase">Current Estimated Budget</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{currentTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={handleReduceBudget}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI Agents Recalculating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Optimize & Reduce My Budget</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Fit My Budget */}
        {activeTab === 'fit' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Enter Your Maximum Budget (INR):
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={targetBudget}
                  onChange={e => setTargetBudget(Number(e.target.value))}
                  step={500}
                  min={3000}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleFitBudget}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 text-white font-bold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking Feasibility...</span>
                </>
              ) : (
                <>
                  <span>Can Venky's AI Fit This Trip?</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {fitResult && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  {fitResult.can_fit ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  )}
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                    {fitResult.status_label}
                  </h5>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Venky's AI Recommended Adjustments:
                  </p>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    {fitResult.suggestions.map((s: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
