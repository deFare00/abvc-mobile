/**
 * Public Health Event (PHE) Data Contracts
 * ASEAN Biological Threats Surveillance Centre (ABVC)
 */

export interface PublicHealthEvent {
  id: string;
  country: string;
  location: string; // e.g. "Indonesia", "Philippines - Manila", "Viet Nam - Ninh Binh"
  title: string; // e.g. "Pertussis in Indonesia", "Leptospirosis in Philippines"
  date: string; // ISO format e.g. "2026-08-29"
  dateFormatted?: string; // Display format e.g. "29/08/2026"
  resourceTitle: string;
  resourceUrl: string;
  sourceInstitution: string; // e.g. "DOH Philippines", "Kemenkes RI", "Vietnam MoH"
  coordinates: [number, number]; // [lon, lat]
  threatLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  pathogen: string;
  casesCount: number;
  deathsCount: number;
  summary: string;
  verified: boolean;
  // Aliases for convenience
  city?: string;
  disease?: string;
  severity?: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  cases?: number;
  deaths?: number;
  sourceAgency?: string;
  sourceUrl?: string;
}

export interface PheFilterState {
  region: string; // e.g. "ASEAN", "Indonesia", "Philippines", "Viet Nam", "Thailand", "Malaysia", "Singapore"
  startDate: string; // "2026-08-04"
  endDate: string; // "2026-09-04"
}

export const DEFAULT_PHE_FILTER: PheFilterState = {
  region: "ASEAN",
  startDate: "2026-08-04",
  endDate: "2026-09-04",
};
