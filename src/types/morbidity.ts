/**
 * Morbidity Surveillance Data Contracts
 * ASEAN Biological Threats Surveillance Centre (ABVC)
 */

export interface MorbiditySummaryKpi {
  totalCases: number;
  activeCases: number;
  recoveredCases: number;
  morbidityRatePer100k: number;
  growthMoMPercent: number; // e.g. +3.4%
  growthTrend: "up" | "down" | "stable";
  alertStatus: "Normal" | "Watch" | "Warning" | "Critical";
  periodLabel: string; // e.g. "January - August 2026"
  lastUpdated: string;
}

export interface MorbidityTrendPoint {
  period: string; // e.g. "Jan", "Feb", "Mar", ...
  fullPeriod: string; // e.g. "January 2026"
  cases: number;
  activeCases: number;
}

export interface MorbidityGenderDistribution {
  maleCases: number;
  femaleCases: number;
  malePercentage: number;
  femalePercentage: number;
}

export interface MorbidityRegionData {
  id: string;
  regionName: string;
  country: string;
  flagCode: string; // Country code for badge
  cases: number;
  percentage: number;
  color: string;
}

export interface MorbidityAgeGenderGroup {
  ageRange: string; // e.g. "0 - 4 Years", "5 - 14 Years", etc.
  ageCategory: string; // "Pediatric", "School Age", etc.
  maleCases: number;
  femaleCases: number;
  totalCases: number;
}

export interface MorbidityRatePoint {
  period: string; // e.g. "Week 25", "Week 26", etc.
  shortPeriod: string; // "W25", "W26"
  ratePer100k: number;
  thresholdPer100k: number;
  isAboveThreshold: boolean;
}

export interface MorbidityHotspotArea {
  id: string;
  name: string;
  provinceOrState: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
  cases: number;
  ratePer100k: number;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  primaryDisease: string;
}

export interface MorbidityDashboardData {
  kpi: MorbiditySummaryKpi;
  trend: MorbidityTrendPoint[];
  gender: MorbidityGenderDistribution;
  regions: MorbidityRegionData[];
  ageGender: MorbidityAgeGenderGroup[];
  morbidityRates: MorbidityRatePoint[];
  topAffectedAreas: MorbidityHotspotArea[];
}
