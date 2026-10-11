export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  language_pref: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Activity {
  id: string;
  time_slot: 'Morning' | 'Afternoon' | 'Evening';
  activity_title: string;
  location_name: string;
  approx_time?: string;
  latitude?: number;
  longitude?: number;
  travel_time_mins: number;
  estimated_cost: number;
  description?: string;
  category: string;
  is_grounded: boolean;
}

export interface ItineraryDay {
  id: string;
  day_number: number;
  title: string;
  theme?: string;
  daily_estimated_cost: number;
  daily_distance_km: number;
  local_transport_mode?: string;
  lunch_recommendation?: string;
  dinner_recommendation?: string;
  activities: Activity[];
}

export interface Hotel {
  id: string;
  name: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  price_per_night: number;
  total_nights: number;
  rating: number;
  amenities_json: string[];
  match_score: number;
  source: string;
  confidence: string;
  is_selected: boolean;
  image_url?: string;
}

export interface BudgetExplanationCard {
  category: string;
  title: string;
  icon: string;
  amount: number;
  reason: string;
  source: string;
}

export interface BudgetBreakdown {
  predicted_total: number;
  per_person: number;
  per_day: number;
  transport_cost: number;
  accommodation_cost: number;
  food_cost: number;
  local_transport_cost: number;
  activities_cost: number;
  misc_cost: number;
  buffer_cost: number;
  lower_range: number;
  upper_range: number;
  overall_confidence: number;
  grounding_ratio: number;
  components_json: Record<string, any>;
  explanation_json: { cards?: BudgetExplanationCard[] };
  savings_tips_json: string[];
}

export interface TripDestination {
  destination_name: string;
  state_name: string;
  latitude?: number;
  longitude?: number;
  best_time?: string;
  ideal_duration_days: number;
  description?: string;
  famous_food_json: Array<{
    name: string;
    typical_price: number;
    famous_spot: string;
    desc: string;
  }>;
  culture_highlights?: string;
  weather_summary?: string;
}

export interface AgentRun {
  agent_name: string;
  status: string;
  duration_ms: number;
  source_count: number;
  error_message?: string;
}

export interface Trip {
  id: string;
  title: string;
  origin_city: string;
  destination: string;
  duration_days: number;
  travelers_count: number;
  adults_count: number;
  children_count: number;
  budget_amount?: number;
  budget_mode: string;
  travel_style: string;
  accommodation_pref: string;
  transport_pref: string;
  language: string;
  status: string;
  is_favorite: boolean;
  created_at: string;
  destination_details?: TripDestination;
  budget_breakdown?: BudgetBreakdown;
  hotels: Hotel[];
  itinerary_days: ItineraryDay[];
  agent_runs: AgentRun[];
  advisor_notes?: string;
}

export interface DestinationCard {
  id: string;
  name: string;
  state: string;
  region: string;
  short_description: string;
  best_season: string;
  recommended_days: number;
  travel_styles: string[];
  interests: string[];
  typical_budget_per_day: number;
  image_url: string;
  is_featured: boolean;
  ai_badge: string;
}

export interface RecommendationItem {
  destination: string;
  state: string;
  why_it_fits: string;
  estimated_budget: number;
  suggested_days: number;
  travel_style: string;
  best_experiences: string[];
  expected_travel_effort: string;
  image_url: string;
}
