import React, { useState } from 'react';
import { Sparkles, Lock, LogIn, UserPlus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  actionMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  actionMessage = 'Please log in or sign in to continue.',
}) => {
  const { quickDemoLogin } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await quickDemoLogin();
      onClose();
      onNavigate('dashboard');
    } catch (err: any) {
      alert(`Login failed: ${err.message || 'Please use email login'}`);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleGoLogin = () => {
    onClose();
    onNavigate('login');
  };

  const handleGoSignup = () => {
    onClose();
    onNavigate('signup');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-cyan-500 items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider mb-2 border border-emerald-500/20">
              Authentication Required
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Sign In to Continue
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {actionMessage || 'Please log in or sign in to plan your trip, explore destinations, and customize personalized Indian itineraries.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Quick Demo Login */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={demoLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-cyan-600 hover:from-amber-600 hover:to-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {demoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>⚡ One-Click Demo Login (Instant Access)</span>
          </button>

          {/* Regular Login */}
          <button
            type="button"
            onClick={handleGoLogin}
            className="w-full py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-4 h-4 text-emerald-500" />
            <span>Sign In with Existing Account</span>
          </button>

          {/* Sign Up */}
          <button
            type="button"
            onClick={handleGoSignup}
            className="w-full py-3 px-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Free Account</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-[11px] text-slate-400">
          <button
            type="button"
            onClick={onClose}
            className="hover:text-slate-600 dark:hover:text-slate-200 underline"
          >
            Stay on Home Page
          </button>
        </div>

      </div>
    </div>
  );
};
