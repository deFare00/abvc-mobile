/**
 * Dashboard API Contracts
 * Backend Rust Endpoint: /api/v1/dashboard/summary
 */

export interface DashboardMetricValue {
  current: number;
  previous: number;
  percentage_change: number;
}

export interface DashboardSummaryCards {
  detected_cases: DashboardMetricValue;
  deaths: DashboardMetricValue;
  validated_events: DashboardMetricValue;
  locations: DashboardMetricValue;
  active_alerts: DashboardMetricValue;
}

export interface EwsAlertApiItem {
  event_id: string;
  disease: string;
  location: string;
  country: string;
  severity: "AWAS" | "CRITICAL" | "HIGH ALERT" | "WARNING" | "SIAGA" | string;
  cases: number;
  deaths: number;
  threshold: number;
  confidence: number;
  has_alert: boolean;
  event_count?: number;
  latest_date?: string;
  latitude?: number;
  longitude?: number;
}

export interface CasesByDiseaseItem {
  disease: string;
  cases: number;
  deaths: number;
  events: number;
}

export interface CountryDistributionItem {
  country: string;
  cases: number;
}

export interface LocationSummaryItem {
  location: string;
  country: string;
  disease: string;
  cases: number;
  deaths: number;
  confidence: number;
  threshold?: number;
  severity?: string;
  has_alert?: boolean;
  event_count?: number;
  event_id?: string;
  latest_date?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DashboardSummaryData {
  summary_cards: DashboardSummaryCards;
  early_warning_system: {
    alerts: EwsAlertApiItem[];
  };
  location_summary?: LocationSummaryItem[];
  filters?: {
    available_years: number[];
    country: string | null;
    year: number;
  };
  year_totals?: {
    active_alerts: number;
    cases: number;
    deaths: number;
    events: number;
    locations: number;
  };
  cases_by_disease?: CasesByDiseaseItem[];
  country_distribution?: CountryDistributionItem[];
  ai_summary?: {
    cached: boolean;
    provider: string;
    text: string;
  };
  updated_at?: string;
}

export interface DashboardSummaryApiResponse {
  data: DashboardSummaryData | null;
  message: string;
  success: boolean;
}
