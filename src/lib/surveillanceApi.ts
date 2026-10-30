// ASEAN Biological Threats Surveillance Centre (ABVC) API Client
// Connects to /api/v1 endpoints synchronized with the surveillance backend

export interface MasterRegionCountry {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  flag_code?: string;
}

export interface MasterRegion {
  id: string;
  code: string;
  name: string;
  member_count: number;
  is_active: boolean;
  description?: string;
  countries: MasterRegionCountry[];
}

export interface MasterCountry {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  home_region?: string;
  flag_code?: string;
  display_order?: number;
  is_active: boolean;
}

export interface DiseaseConcept {
  id: string;
  disease_id: string;
  canonical_name: string;
  category?: string;
  is_active: boolean;
  is_zoonotic?: boolean;
}

export interface EbsLocation {
  location_name: string;
  latitude: number;
  longitude: number;
  cases: number;
  deaths: number;
  disease: string;
  severity?: "NORMAL" | "WASPADA" | "SIAGA" | "AWAS" | string;
  is_hot?: boolean;
  country?: string;
  province?: string;
  city?: string | null;
  case_date?: string;
  latest_date?: string;
  sources?: Array<{
    source_name?: string;
    source_type?: string;
    url?: string;
    published_at?: string;
  }>;
  detail?: {
    title?: string;
    content?: string;
    url?: string;
    crawled_at?: string;
    published_at?: string;
    disease_classification?: string;
  };
}

export interface EbsCountryBurden {
  name: string;
  cases: number;
  deaths: number;
  events: number;
  resolved?: boolean;
}

export interface EbsDashboardData {
  kpis: {
    cases: number;
    deaths: number;
    events: number;
    active_alerts: number;
    active_locations: number;
    locations: number;
    locations_mapped: number;
    snapshot_computed_at?: string;
  };
  locations: EbsLocation[];
  by_country: EbsCountryBurden[];
  weekly_trend?: Array<{
    date: string;
    cases: number;
    deaths: number;
  }>;
  available_diseases?: string[];
}

export interface IbsCountryBurden {
  name: string;
  cases: number;
  deaths: number;
  latest_week?: number;
  diseases?: Array<{ disease: string; cases: number; deaths: number }>;
  weekly?: Array<{ week: number; cases: number; deaths: number }>;
}

export interface IbsDashboardData {
  kpis: {
    cases: number;
    deaths: number;
    cfr: number;
  };
  locations: Array<{
    location_name: string;
    latitude: number;
    longitude: number;
    cases: number;
    deaths: number;
    disease?: string;
    country?: string;
  }>;
  by_country: IbsCountryBurden[];
  weekly_trend?: Array<{
    week?: number;
    epi_week?: number;
    cases?: number;
    deaths?: number;
    period?: string;
    year?: number;
  }>;
  available_diseases?: string[];
}

export interface AnalysisEventItem {
  id: string;
  lat: number;
  lon: number;
  cases: number;
  deaths: number;
  disease: string;
  country: string;
  location: string;
  source: string;
  source_name?: string;
  url?: string;
  is_cumulative?: boolean;
  mapped?: boolean;
  published_date?: string;
  case_date?: string;
  transmission_route?: string;
}

export interface AnalysisEventsData {
  status: string;
  start_date: string;
  end_date: string;
  country?: string;
  totals: {
    alerts: number;
    cases: number;
    deaths: number;
    countries: number;
    diseases: number;
    reports: number;
    locations_mapped: number;
    points: number;
  };
  items: AnalysisEventItem[];
  diseases?: string[];
  categories?: string[];
}

export interface AnalysisConfigData {
  status: string;
  diseases?: Array<{ name: string; category: string | null; host_scope: string | null }>;
  master_regions?: Array<{ code: string; name: string; countries: Array<{ name: string; iso3: string }> }>;
}

export interface SurveillanceFilterParams {
  diseases?: string[];
  disease?: string;
  region?: string;
  scope?: string;
  countries?: string[];
  country?: string;
  startDate?: string;
  endDate?: string;
  startWeek?: number;
  endWeek?: number;
  startYear?: number;
  endYear?: number;
}

export interface KpiSnapshotData {
  kpis: {
    active_alerts?: number;
    active_locations?: number;
    cases?: number;
    cases_reviewed?: number;
    cases_unreviewed?: number;
    deaths?: number;
    deaths_reviewed?: number;
    deaths_unreviewed?: number;
    events?: number;
    events_reviewed?: number;
    events_unreviewed?: number;
    locations?: number;
    locations_mapped?: number;
    snapshot_computed_at?: string;
    snapshot_stale?: boolean;
  };
}

const API_BASE = "/mobile";

// Helper: build standard query params for EBS & related endpoints
export function buildEbsQueryParams(params?: SurveillanceFilterParams): URLSearchParams {
  const q = new URLSearchParams();
  const ctry = params?.country || params?.region;
  const country = !ctry || ctry === "all" ? "ASEAN" : ctry;
  q.set("country", country);
  if (country === "ASEAN" || country === "all") {
    q.set("scope", "asean11");
  }
  if (params?.diseases && params.diseases.length > 0) {
    if (params.diseases.length === 1) {
      q.set("disease", params.diseases[0]);
    } else {
      q.set("diseases", params.diseases.join(","));
    }
  } else if (params?.disease && params.disease !== "all") {
    q.set("disease", params.disease);
  }
  if (params?.countries && params.countries.length > 0) {
    q.set("countries", params.countries.join(","));
  }
  if (params?.startDate) q.set("start_date", params.startDate);
  if (params?.endDate) q.set("end_date", params.endDate);
  return q;
}

// 1. Fetch EBS Public Dashboard with Filter Parameters
export async function getEbsDashboard(params?: SurveillanceFilterParams): Promise<EbsDashboardData | null> {
  try {
    const q = buildEbsQueryParams(params);
    const queryString = q.toString();
    const res = await fetch(`${API_BASE}/api/v1/public-dashboard${queryString ? `?${queryString}` : ""}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("Failed to fetch EBS dashboard:", err);
    return null;
  }
}

// 1b. Fetch KPI Snapshot (Materialized & Filter-Synchronized with NLP)
export async function getKpiSnapshot(params?: SurveillanceFilterParams): Promise<KpiSnapshotData | null> {
  try {
    const q = buildEbsQueryParams(params);
    const queryString = q.toString();
    const res = await fetch(`${API_BASE}/api/v1/kpi-snapshot${queryString ? `?${queryString}` : ""}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("Failed to fetch KPI snapshot:", err);
    return null;
  }
}

// 2. Fetch IBS Surveillance with Filter Parameters (Synchronized with NLP Lite Dashboard)
export async function getIbsSurveillance(params?: SurveillanceFilterParams): Promise<IbsDashboardData | null> {
  try {
    const q = new URLSearchParams();
    
    // Country / Region handling
    if (params?.countries && params.countries.length > 0) {
      q.set("country", params.countries.join("|"));
    } else if (params?.country && params.country !== "all") {
      q.set("country", params.country);
    } else if (params?.region && params.region !== "all") {
      q.set("country", params.region);
    } else {
      q.set("country", "ASEAN");
    }

    // Disease handling: NLP IBS splits on "|" or single disease
    if (params?.diseases && params.diseases.length > 0) {
      if (params.diseases.length === 1) {
        q.set("disease", params.diseases[0]);
      } else {
        q.set("disease", params.diseases.join("|"));
      }
    } else if (params?.disease && params.disease !== "all") {
      q.set("disease", params.disease);
    }

    if (params?.startWeek) q.set("start_week", String(params.startWeek));
    if (params?.endWeek) q.set("end_week", String(params.endWeek));
    if (params?.startYear) q.set("start_year", String(params.startYear));
    if (params?.endYear) {
      q.set("end_year", String(params.endYear));
      q.set("year", String(params.endYear));
    } else {
      q.set("year", "2026");
    }

    const queryString = q.toString();
    const res = await fetch(`${API_BASE}/api/v1/ibs/surveillance${queryString ? `?${queryString}` : ""}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("Failed to fetch IBS surveillance:", err);
    return null;
  }
}

// 3. Fetch Master Regions
export async function getMasterRegions(): Promise<MasterRegion[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/master/regions?per_page=100`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rows = json.data || json;
    return Array.isArray(rows) ? rows.filter((r: MasterRegion) => r.is_active) : [];
  } catch (err) {
    console.error("Failed to fetch master regions:", err);
    return [];
  }
}

// 4. Fetch Master Countries
export async function getMasterCountries(): Promise<MasterCountry[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/master/countries?per_page=200&is_active=true`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rows = json.data || json;
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.error("Failed to fetch master countries:", err);
    return [];
  }
}

// 5. Fetch Disease Concepts
export async function getDiseaseConcepts(): Promise<DiseaseConcept[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/disease-concepts?per_page=100&is_active=true`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rows = json.data || json;
    return Array.isArray(rows)
      ? rows.filter((d: DiseaseConcept) => d.is_active && !d.canonical_name.toUpperCase().startsWith("UNKNOWN"))
      : [];
  } catch (err) {
    console.error("Failed to fetch disease concepts:", err);
    return [];
  }
}

// 6. Fetch Analysis Events
export async function getAnalysisEvents(params?: {
  start?: string;
  end?: string;
  scope?: string;
  country?: string;
  diseases?: string[];
}): Promise<AnalysisEventsData | null> {
  try {
    const q = new URLSearchParams();
    q.set("start", params?.start || "2026-09-29");
    q.set("end", params?.end || "2026-10-29");
    q.set("scope", params?.scope || "ASEAN+3");
    if (params?.country) q.set("country", params.country);
    if (params?.diseases && params.diseases.length > 0) {
      params.diseases.forEach((d) => q.append("diseases", d));
    }

    const res = await fetch(`${API_BASE}/api/v1/analysis-map/events?${q.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("Failed to fetch Analysis events:", err);
    return null;
  }
}

export interface PriorityAlertCountry {
  country: string;
  iso: string;
  cases: number;
  deaths: number;
  events?: number;
  alerts?: number;
  is_other?: boolean;
}

export interface PriorityDiseaseAlert {
  disease: string;
  total_asean_cases: number;
  total_deaths: number;
  top_country: string;
  top_country_iso: string;
  top_country_cases: number;
  latest_published?: string;
  latest_published_label?: string;
  severity?: string;
  event_count?: number;
  alert_count?: number;
  country_breakdown: PriorityAlertCountry[];
}

export interface DiseaseTrendDailyPoint {
  date: string;
  date_label: string;
  [seriesKey: string]: any;
}

export interface DiseaseTrendSeriesItem {
  disease: string;
  key: string;
}

export interface DiseaseTrendOverviewData {
  daily_trends: DiseaseTrendDailyPoint[];
  priority_alerts: PriorityDiseaseAlert[];
  trend_series: DiseaseTrendSeriesItem[];
  summary: {
    active_locations: number;
    top_burden_country: string;
    top_burden_disease: string;
    total_cases_tracked: number;
    total_deaths: number;
    total_diseases: number;
    total_events: number;
    trend_days: number;
  };
}

export interface WeeklyTrendItem {
  year: number;
  month?: number;
  month_label?: string;
  week?: number;
  week_label?: string;
  morbidity: number;
  mortality: number;
  cfr_pct: number;
  news_coverage?: number;
  event_count?: number;
}

export interface TopDiseaseMorbidity {
  disease: string;
  total_cases: number;
  total_deaths: number;
  cfr_pct: number;
  event_count: number;
}

export interface MorbidityMortalityData {
  summary: {
    total_morbidity: number;
    total_mortality: number;
    total_news_coverage: number;
    total_events: number;
    cfr_pct?: number;
    weeks?: number;
  };
  top_diseases: TopDiseaseMorbidity[];
  weekly_trends: WeeklyTrendItem[];
}

export interface SpatialHeatmapMonth {
  month_num: number;
  month_name: string;
  cases: number;
  deaths: number;
  events: number;
  alerts?: number;
}

export interface SpatialHeatmapCountry {
  country: string;
  iso: string;
  total_cases: number;
  total_deaths: number;
  total_events: number;
  months: SpatialHeatmapMonth[];
  diseases: Array<{
    disease: string;
    cases: number;
    deaths: number;
    events: number;
    latest_published?: string;
  }>;
}

export interface SpatialHeatmapData {
  countries: SpatialHeatmapCountry[];
  summary: {
    total_cases: number;
    total_deaths: number;
    total_events: number;
    total_countries: number;
    active_locations: number;
  };
}

// 7. Fetch Analysis Config
export async function getAnalysisConfig(): Promise<AnalysisConfigData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/analysis-map/config`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("Failed to fetch Analysis config:", err);
    return null;
  }
}

// 8. Fetch Disease Trend Overview (Synchronized with Ubuntu NLP)
export async function getDiseaseTrendOverview(
  params?: SurveillanceFilterParams
): Promise<DiseaseTrendOverviewData | null> {
  try {
    const q = buildEbsQueryParams(params);
    const res = await fetch(`${API_BASE}/api/v1/disease-trend-overview?${q.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("Failed to fetch disease trend overview:", err);
    return null;
  }
}

// 9. Fetch Morbidity & Mortality (Synchronized with Ubuntu NLP)
export async function getMorbidityMortality(
  params?: SurveillanceFilterParams
): Promise<MorbidityMortalityData | null> {
  try {
    const q = buildEbsQueryParams(params);
    const res = await fetch(`${API_BASE}/api/v1/morbidity-mortality?${q.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("Failed to fetch morbidity mortality:", err);
    return null;
  }
}

// 10. Fetch Spatial Heatmap (Synchronized with Ubuntu NLP)
export async function getSpatialHeatmap(
  params?: SurveillanceFilterParams
): Promise<SpatialHeatmapData | null> {
  try {
    const q = buildEbsQueryParams(params);
    const res = await fetch(`${API_BASE}/api/v1/spatial-heatmap?${q.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error("Failed to fetch spatial heatmap:", err);
    return null;
  }
}

// Helper: Distinct places count matching NLP placeCount(mapLocations)
export function placeCount(locations?: Array<{ country?: string; location_name?: string }>): number {
  if (!locations || locations.length === 0) return 0;
  const set = new Set<string>();
  for (const l of locations) {
    const c = String(l?.country || "").trim().toLowerCase();
    const n = String(l?.location_name || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (c || n) set.add(`${c}|${n}`);
  }
  return set.size;
}

// Helper: Compute previous period window and formatted labels matching NLP computePreviousPeriod
export function computePreviousPeriod(startDateStr?: string | null, endDateStr?: string | null) {
  if (!startDateStr || !endDateStr) {
    const now = new Date();
    const curStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prevStart = new Date(curStart.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startIso = prevStart.toISOString().slice(0, 10);
    const endIso = curStart.toISOString().slice(0, 10);
    return {
      startIso,
      endIso,
      label: `Aug 30th, 2026 — Sep 30th, 2026`,
    };
  }

  const [sY, sM, sD] = startDateStr.split("-").map(Number);
  const curStart = new Date(Date.UTC(sY, sM - 1, sD));

  const prevEndIso = startDateStr;
  const prevStart = new Date(curStart.getTime());
  prevStart.setUTCMonth(prevStart.getUTCMonth() - 1);
  if (prevStart.getUTCDate() !== sD) {
    prevStart.setUTCDate(0);
  }
  const prevStartIso = prevStart.toISOString().slice(0, 10);

  const formatPart = (dStr: string) => {
    const [y, m, d] = dStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const month = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    const suffix = (day: number) => {
      if (day >= 11 && day <= 13) return "th";
      switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };
    return `${month} ${d}${suffix(d)}, ${y}`;
  };

  return {
    startIso: prevStartIso,
    endIso: prevEndIso,
    label: `${formatPart(prevStartIso)} — ${formatPart(prevEndIso)}`,
  };
}
