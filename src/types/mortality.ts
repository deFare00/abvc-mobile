/**
 * Mortality Surveillance Data Contracts
 * ASEAN Biological Threats Surveillance Centre (ABVC)
 */

export interface MortalitySummaryKpi {
  totalDeaths: number;
  caseFatalityRate: number; // e.g. 1.97%
  growthMoMPercent: number; // e.g. -4.2%
  growthTrend: "up" | "down" | "stable";
  icuCriticalCases: number;
  laboratoryVerifiedRate: number; // e.g. 94.8%
  periodLabel: string; // e.g. "January - August 2026"
  lastUpdated: string;
}

export interface MortalityTrendPoint {
  period: string; // e.g. "Jan", "Feb"
  fullPeriod: string; // e.g. "January 2026"
  deaths: number;
  caseFatalityRate: number;
}

export interface MortalityAgeGroupData {
  ageRange: string; // e.g. "0 - 4 Years"
  ageCategory: string; // e.g. "Pediatric (Under 5)"
  deaths: number;
  percentage: number;
  cfrRate: number; // CFR within this cohort %
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
}

export interface MortalityGenderDistribution {
  maleDeaths: number;
  femaleDeaths: number;
  malePercentage: number;
  femalePercentage: number;
  sexRatio: string; // e.g. "1.30 : 1"
}

export interface MortalityRegionData {
  id: string;
  country: string;
  regionName: string;
  flagCode: string;
  deaths: number;
  percentage: number;
  cfrRate: number;
  color: string;
}

export interface MortalityCauseData {
  id: string;
  causeName: string;
  pathogenType: string;
  deaths: number;
  percentage: number;
  cfrRate: number;
  color: string;
}

export interface MortalityAgeGenderStackedGroup {
  ageRange: string;
  ageCategory: string;
  maleDeaths: number;
  femaleDeaths: number;
  totalDeaths: number;
}

export interface MortalityRatePoint {
  period: string; // e.g. "Week 25"
  shortPeriod: string; // "W25"
  cfrRate: number; // %
  benchmarkThreshold: number; // e.g. 2.0%
  isAboveThreshold: boolean;
}

export interface MortalityDashboardData {
  kpi: MortalitySummaryKpi;
  trend: MortalityTrendPoint[];
  ageGroups: MortalityAgeGroupData[];
  gender: MortalityGenderDistribution;
  regions: MortalityRegionData[];
  causes: MortalityCauseData[];
  ageGenderStacked: MortalityAgeGenderStackedGroup[];
  mortalityRates: MortalityRatePoint[];
}
