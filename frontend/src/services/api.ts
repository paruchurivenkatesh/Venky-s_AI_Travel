import {
  AuthResponse,
  User,
  Trip,
  DestinationCard,
  RecommendationItem
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('venkys_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred.';
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      errorMsg = `Server error (${response.status}): ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Authentication
  auth: {
    register: (data: { email: string; password: string; full_name?: string; language_pref?: string }) =>
      request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => request<User>('/auth/me'),
    forgotPassword: (email: string) =>
      request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  },

  // Trips
  trips: {
    planTrip: (payload: any) =>
      request<Trip>('/trips/plan', { method: 'POST', body: JSON.stringify(payload) }),
    getUserTrips: () => request<Trip[]>('/trips'),
    getTripById: (id: string) => request<Trip>(`/trips/${id}`),
    updateTrip: (id: string, payload: { title?: string; is_favorite?: boolean }) =>
      request<Trip>(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteTrip: (id: string) =>
      request<{ message: string }>(`/trips/${id}`, { method: 'DELETE' }),
    toggleFavorite: (id: string) =>
      request<{ id: string; is_favorite: boolean }>(`/trips/${id}/favorite`, { method: 'POST' }),
    duplicateTrip: (id: string) =>
      request<Trip>(`/trips/${id}/duplicate`, { method: 'POST' }),
    optimizeBudget: (id: string, action = 'reduce') =>
      request<{
        current_budget: number;
        optimized_budget: number;
        savings_amount: number;
        savings_percentage: number;
        breakdown: Array<{ category: string; savings: number; action: string }>;
      }>(`/trips/${id}/optimize-budget`, { method: 'POST', body: JSON.stringify({ action }) }),
    fitBudget: (id: string, target_budget: number) =>
      request<{
        target_budget: number;
        predicted_budget: number;
        can_fit: boolean;
        difference: number;
        status_label: string;
        suggestions: string[];
      }>(`/trips/${id}/fit-budget`, { method: 'POST', body: JSON.stringify({ target_budget }) }),
    chat: (id: string, message: string) =>
      request<{ reply: string }>(`/trips/${id}/chat`, { method: 'POST', body: JSON.stringify({ message }) }),
    getPdfDownloadUrl: (id: string) => `${API_BASE}/trips/${id}/pdf`,
  },

  // Destinations Catalog & Smart Recommender
  destinations: {
    getDestinations: (params?: { region?: string; state?: string; tag?: string }) => {
      const q = new URLSearchParams();
      if (params?.region) q.append('region', params.region);
      if (params?.state) q.append('state', params.state);
      if (params?.tag) q.append('tag', params.tag);
      return request<DestinationCard[]>(`/destinations?${q.toString()}`);
    },
    getDestinationById: (id: string) => request<DestinationCard>(`/destinations/${id}`),
    recommend: (payload: { origin_city?: string; budget?: number; days?: number; query?: string }) =>
      request<{ recommendations: RecommendationItem[]; query_analyzed: string }>(
        '/destinations/recommend',
        { method: 'POST', body: JSON.stringify(payload) }
      ),
  },

  // Health
  health: () => request<{ status: string; service: string }>('/health'),
};
