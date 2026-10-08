import React, { useState } from 'react';
import { MultiStepPlanner } from '../components/MultiStepPlanner';
import { PlanningAnimation } from '../components/PlanningAnimation';
import { DestinationCard, Trip } from '../types';
import { api } from '../services/api';

interface PlanTripPageProps {
  destinations: DestinationCard[];
  onTripGenerated: (trip: Trip) => void;
}

export const PlanTripPage: React.FC<PlanTripPageProps> = ({
  destinations,
  onTripGenerated,
}) => {
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanSubmit = async (formData: any) => {
    setError(null);
    setPlanning(true);

    try {
      const trip = await api.trips.planTrip(formData);
      // Wait a moment for visual delight of the multi-agent animation completion
      setTimeout(() => {
        setPlanning(false);
        onTripGenerated(trip);
      }, 1500);
    } catch (err: any) {
      setPlanning(false);
      setError(err.message || 'An error occurred while generating the travel plan.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {planning ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl">
          <PlanningAnimation />
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs md:text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <MultiStepPlanner
            destinations={destinations}
            onSubmit={handlePlanSubmit}
            loading={planning}
          />
        </div>
      )}
    </div>
  );
};
