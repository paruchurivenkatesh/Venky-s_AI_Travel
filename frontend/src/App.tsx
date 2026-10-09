import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { PlanTripPage } from './pages/PlanTripPage';
import { TripResultPage } from './pages/TripResultPage';
import { DashboardPage } from './pages/DashboardPage';
import { DestinationsPage } from './pages/DestinationsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DestinationCard, Trip } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [destinations, setDestinations] = useState<DestinationCard[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Load curated Indian destinations on mount
  useEffect(() => {
    api.destinations.getDestinations()
      .then(data => setDestinations(data))
      .catch(err => console.error('Failed to load destinations:', err));
  }, []);

  const handleStartPlanning = (dest?: string) => {
    setCurrentTab('plan');
  };

  const handleTripGenerated = (trip: Trip) => {
    setSelectedTrip(trip);
    setCurrentTab('trip');
  };

  const handleSelectTrip = async (tripId: string) => {
    try {
      const trip = await api.trips.getTripById(tripId);
      setSelectedTrip(trip);
      setCurrentTab('trip');
    } catch (err: any) {
      alert(`Error loading trip: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar currentTab={currentTab} onNavigate={(tab) => setCurrentTab(tab)} />

      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingPage
            destinations={destinations}
            onStartPlanning={handleStartPlanning}
            onExplore={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'explore' && (
          <DestinationsPage
            destinations={destinations}
            onStartPlanning={handleStartPlanning}
          />
        )}

        {currentTab === 'plan' && (
          <PlanTripPage
            destinations={destinations}
            onTripGenerated={handleTripGenerated}
          />
        )}

        {currentTab === 'trip' && selectedTrip && (
          <TripResultPage
            trip={selectedTrip}
            onTripUpdated={(updated) => setSelectedTrip(updated)}
            onBackToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectTrip={handleSelectTrip}
            destinations={destinations}
          />
        )}

        {currentTab === 'login' && (
          <LoginPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSuccess={() => setCurrentTab(user ? 'dashboard' : 'home')}
          />
        )}

        {currentTab === 'signup' && (
          <SignupPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onSuccess={() => setCurrentTab('dashboard')}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
