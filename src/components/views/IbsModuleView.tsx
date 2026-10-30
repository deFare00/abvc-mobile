"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  RotateCcw,
  Check,
  Search,
  X,
  Globe2,
  Bug,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  MapPin,
  Activity,
  Layers,
  FileText,
  SlidersHorizontal,
  Table,
  Skull,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import ModuleFooterNav from "@/components/ModuleFooterNav";
import AseanSurveillanceMapMobile from "@/components/AseanSurveillanceMapMobile";
import CountryFlag from "@/components/CountryFlag";
import {
  getIbsSurveillance,
  getMasterRegions,
  getMasterCountries,
  getDiseaseConcepts,
  IbsDashboardData,
  IbsCountryBurden,
} from "@/lib/surveillanceApi";

interface IbsModuleViewProps {
  onBackToHome: () => void;
  onNavigateModule: (module: "ebs" | "ibs" | "analysis") => void;
}

type IbsSubTab = "overview" | "map" | "trends" | "matrix";

const ibsSubTabs: { id: IbsSubTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "map", label: "Spatial Outbreak Map" },
  { id: "trends", label: "Epi Trends & CFR" },
  { id: "matrix", label: "Location Summary" },
];

const DEFAULT_ASEAN_COUNTRIES = [
  "Brunei Darussalam",
  "Cambodia",
  "Indonesia",
  "Lao PDR",
  "Malaysia",
  "Myanmar",
  "Philippines",
  "Singapore",
  "Thailand",
  "Timor-Leste",
  "Viet Nam",
];

const ASEAN_COUNTRIES_INFO: { name: string; iso: string }[] = [
  { name: "Brunei Darussalam", iso: "BRN" },
  { name: "Cambodia", iso: "KHM" },
  { name: "Indonesia", iso: "IDN" },
  { name: "Lao PDR", iso: "LAO" },
  { name: "Malaysia", iso: "MYS" },
  { name: "Myanmar", iso: "MMR" },
  { name: "Philippines", iso: "PHL" },
  { name: "Singapore", iso: "SGP" },
  { name: "Thailand", iso: "THA" },
  { name: "Timor-Leste", iso: "TLS" },
  { name: "Viet Nam", iso: "VNM" },
];

const formatCompact = (v: number): string => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(v);
};

const DEFAULT_DISEASE_LIST = [
  "Dengue",
  "Acute Respiratory Infection (ARI/ISPA)",
  "Avian Influenza",
  "Cholera",
  "COVID-19",
  "Diphtheria",
  "Hand, Foot, and Mouth Disease (HFMD)",
  "Influenza",
  "Japanese Encephalitis",
  "Legionellosis",
  "Leptospirosis",
  "Malaria",
  "Measles",
  "Melioidosis",
  "Meningococcal Disease",
  "Mpox",
  "Nipah Virus Infection",
  "Pertussis",
  "Rabies",
  "Salmonellosis",
  "Tuberculosis (TB)",
  "Typhoid",
  "Yellow Fever",
  "Zika Virus Infection",
];

function sameCountry(a: string, b: string): boolean {
  if (!a || !b) return false;
  const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_.'"]/g, "");
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  if (
    (na.includes("viet") && nb.includes("viet")) ||
    (na.includes("lao") && nb.includes("lao")) ||
    (na.includes("brunei") && nb.includes("brunei"))
  )
    return true;
  return false;
}

function storedCountryValue(name: string): string {
  const key = name.trim().toLowerCase();
  if (key.includes("brunei")) return "Brunei";
  if (key === "lao pdr" || key === "laos" || key === "lao") return "Laos";
  if (key === "viet nam" || key === "vietnam") return "Vietnam";
  if (key === "china" || key === "tiongkok") return "China";
  if (key === "japan" || key === "jepang") return "Japan";
  if (key === "south korea" || key === "korea") return "South Korea";
  return name;
}

export default function IbsModuleView({
  onBackToHome,
  onNavigateModule,
}: IbsModuleViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<IbsSubTab>("overview");
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Synchronized IBS Data State
  const [data, setData] = useState<IbsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  // Master Catalogs
  const [diseaseOptions, setDiseaseOptions] = useState<string[]>(DEFAULT_DISEASE_LIST);
  const [countryOptions, setCountryOptions] = useState<string[]>(DEFAULT_ASEAN_COUNTRIES);

  // Filter Applied States (Multi-select Diseases)
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(["Dengue"]);
  const [selectedRegionCountry, setSelectedRegionCountry] = useState("ASEAN (11)");
  const [startEpiWeek, setStartEpiWeek] = useState(1);
  const [endEpiWeek, setEndEpiWeek] = useState(43);
  const [startEpiYear, setStartEpiYear] = useState(2026);
  const [endEpiYear, setEndEpiYear] = useState(2026);

  // Local Draft States (for user selection before clicking Apply)
  const [draftDiseases, setDraftDiseases] = useState<string[]>(["Dengue"]);
  const [draftRegionCountry, setDraftRegionCountry] = useState("ASEAN (11)");
  const [draftStartWeek, setDraftStartWeek] = useState(1);
  const [draftEndWeek, setDraftEndWeek] = useState(43);
  const [draftStartYear, setDraftStartYear] = useState(2026);
  const [draftEndYear, setDraftEndYear] = useState(2026);

  // Modals for Mobile selection
  const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  // Epi Trends extended breakdown toggle (Show / Hide Trends)
  const [showExtendedTrends, setShowExtendedTrends] = useState(true);

  // Surveillance Location Summary Metric Switcher (Cases / Deaths)
  const [matrixMetric, setMatrixMetric] = useState<"cases" | "deaths">("cases");
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{
    country: string;
    iso: string;
    week: number;
    cases: number;
    deaths: number;
  } | null>(null);

  // Selected Country for interactive highlight
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Load Master data & initial IBS data on mount
  useEffect(() => {
    let alive = true;

    // Load master disease concepts & regions
    Promise.all([
      getDiseaseConcepts(),
      getMasterCountries(),
      getMasterRegions(),
    ]).then(([concepts, countries, regions]) => {
      if (!alive) return;
      if (concepts && concepts.length > 0) {
        const canonicals = Array.from(
          new Set(concepts.map((c) => c.canonical_name.trim()))
        ).sort((a, b) => a.localeCompare(b));
        setDiseaseOptions(canonicals);
      }
      if (countries && countries.length > 0) {
        const asean = countries
          .filter((c) =>
            [
              "BRN", "KHM", "IDN", "LAO", "MYS", "MMR", "PHL", "SGP", "THA", "TLS", "VNM"
            ].includes(c.iso3)
          )
          .map((c) => c.name);
        if (asean.length > 0) setCountryOptions(asean);
      }
    });

    // Fetch live IBS data with default filters
    getIbsSurveillance({
      diseases: ["Dengue"],
      country: "ASEAN",
      startWeek: 1,
      endWeek: 43,
      startYear: 2026,
      endYear: 2026,
    }).then((res) => {
      if (alive && res) {
        setData(res);
        if (res.available_diseases && res.available_diseases.length > 0) {
          setDiseaseOptions((prev) =>
            Array.from(new Set([...prev, ...res.available_diseases!])).sort(
              (a, b) => a.localeCompare(b)
            )
          );
        }
        setLoading(false);
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  const currentIndex = ibsSubTabs.findIndex((t) => t.id === activeSubTab);

  const handlePrevTab = () => {
    if (currentIndex > 0) {
      setActiveSubTab(ibsSubTabs[currentIndex - 1].id);
    }
  };

  const handleNextTab = () => {
    if (currentIndex < ibsSubTabs.length - 1) {
      setActiveSubTab(ibsSubTabs[currentIndex + 1].id);
    }
  };

  // Scroll active tab pill into view smoothly
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeEl = tabsContainerRef.current.querySelector(
        `[data-tab="${activeSubTab}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeSubTab]);

  // Handle Apply Filter
  const handleApplyFilter = async () => {
    setFilterLoading(true);
    setSelectedDiseases(draftDiseases);
    setSelectedRegionCountry(draftRegionCountry);
    setStartEpiWeek(draftStartWeek);
    setEndEpiWeek(draftEndWeek);
    setStartEpiYear(draftStartYear);
    setEndEpiYear(draftEndYear);

    let queryCountry = "ASEAN";
    if (draftRegionCountry.startsWith("ASEAN+3")) queryCountry = "ASEAN+3";
    else if (draftRegionCountry.toLowerCase().startsWith("global")) queryCountry = "GLOBAL";
    else if (!draftRegionCountry.startsWith("ASEAN")) {
      queryCountry = storedCountryValue(draftRegionCountry);
    }

    const res = await getIbsSurveillance({
      diseases: draftDiseases,
      country: queryCountry,
      startWeek: draftStartWeek,
      endWeek: draftEndWeek,
      startYear: draftStartYear,
      endYear: draftEndYear,
    });

    if (res) {
      setData(res);
    }
    setFilterLoading(false);
  };

  // Handle Reset Filter
  const handleResetFilter = async () => {
    setFilterLoading(true);
    const defDiseases = ["Dengue"];
    const defRegion = "ASEAN (11)";
    const defStartWk = 1;
    const defEndWk = 43;
    const defStartYr = 2026;
    const defEndYr = 2026;

    setDraftDiseases(defDiseases);
    setDraftRegionCountry(defRegion);
    setDraftStartWeek(defStartWk);
    setDraftEndWeek(defEndWk);
    setDraftStartYear(defStartYr);
    setDraftEndYear(defEndYr);

    setSelectedDiseases(defDiseases);
    setSelectedRegionCountry(defRegion);
    setStartEpiWeek(defStartWk);
    setEndEpiWeek(defEndWk);
    setStartEpiYear(defStartYr);
    setEndEpiYear(defEndYr);

    const res = await getIbsSurveillance({
      diseases: defDiseases,
      country: "ASEAN",
      startWeek: defStartWk,
      endWeek: defEndWk,
      startYear: defStartYr,
      endYear: defEndYr,
    });

    if (res) {
      setData(res);
    }
    setFilterLoading(false);
  };

  // Synchronized Countries data for Choropleth & table (Full 11 ASEAN list matching prototype)
  const mapCountries = useMemo(() => {
    const byCountry = data?.by_country || [];
    return DEFAULT_ASEAN_COUNTRIES.map((countryName) => {
      const match = byCountry.find((c) => sameCountry(c.name, countryName));
      return {
        name: countryName,
        cases: match ? match.cases : 0,
        deaths: match ? match.deaths : 0,
        latest_week: match ? match.latest_week : undefined,
      };
    });
  }, [data]);

  // Locations for markers
  const mapLocations = useMemo(() => {
    if (!data?.locations) return [];
    return data.locations.map((loc) => ({
      location_name: loc.location_name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      cases: loc.cases,
      deaths: loc.deaths,
      disease: loc.disease || (selectedDiseases.length > 0 ? selectedDiseases.join(", ") : "Dengue"),
      country: loc.country,
    }));
  }, [data, selectedDiseases]);

  // Real KPIs
  const kpiCases = data?.kpis?.cases ?? 11054;
  const kpiDeaths = data?.kpis?.deaths ?? 0;
  const kpiCfr = data?.kpis?.cfr ?? 0;

  // Individual Country Trends (Report Cases & CFR Data) matching Image 1
  const individualCountryTrends = useMemo(() => {
    const rawTrend = data?.weekly_trend || [];
    const byCountry = data?.by_country || [];
    const maxScopeCases = Math.max(kpiCases, ...mapCountries.map((c) => c.cases), 1);

    // 1. Scope aggregate item (ASEAN)
    const aseanWeeklyMap = new Map<number, { cases: number; deaths: number; cfr: number }>();
    (rawTrend || []).forEach((t: any) => {
      const wNum = t.weekNum ?? t.week ?? t.epi_week ?? 1;
      aseanWeeklyMap.set(wNum, {
        cases: Number(t.cases) || 0,
        deaths: Number(t.deaths) || 0,
        cfr: Number(t.cfr) || 0,
      });
    });

    const aseanTrend: { week: string; weekNum: number; label: string; cases: number; deaths: number; cfr: number }[] = [];
    for (let w = startEpiWeek; w <= endEpiWeek; w++) {
      const pt = aseanWeeklyMap.get(w) || { cases: 0, deaths: 0, cfr: 0 };
      aseanTrend.push({
        week: `Week ${w}`,
        weekNum: w,
        label: `${w}, ${endEpiYear}`,
        cases: pt.cases,
        deaths: pt.deaths,
        cfr: pt.cfr,
      });
    }

    const items: Array<{
      id: string;
      name: string;
      cases: number;
      deaths: number;
      cfr: number;
      trend: typeof aseanTrend;
      hasData: boolean;
      fillPercent: number;
    }> = [
      {
        id: "scope-aggregate",
        name: selectedRegionCountry.startsWith("ASEAN+3") ? "ASEAN +3" : "ASEAN",
        cases: kpiCases,
        deaths: kpiDeaths,
        cfr: kpiCfr,
        trend: aseanTrend,
        hasData: aseanTrend.some((t) => t.cases > 0 || t.deaths > 0),
        fillPercent: 100,
      },
    ];

    // 2. Individual ASEAN Countries
    ASEAN_COUNTRIES_INFO.forEach((c) => {
      const match = byCountry.find((item) => sameCountry(item.name, c.name));
      const cCases = match ? match.cases : 0;
      const cDeaths = match ? match.deaths : 0;
      const cCfr = cCases > 0 ? Number(((cDeaths / cCases) * 100).toFixed(2)) : 0;
      const realWeekly = Array.isArray(match?.weekly) ? match.weekly : [];

      const weekMap = new Map<number, { cases: number; deaths: number }>();
      realWeekly.forEach((pt: any) => {
        weekMap.set(Number(pt.week), {
          cases: Number(pt.cases) || 0,
          deaths: Number(pt.deaths) || 0,
        });
      });

      const countryTrend: typeof aseanTrend = [];
      for (let w = startEpiWeek; w <= endEpiWeek; w++) {
        const pt = weekMap.get(w) || { cases: 0, deaths: 0 };
        const ptCfr = pt.cases > 0 ? Number(((pt.deaths / pt.cases) * 100).toFixed(2)) : 0;
        countryTrend.push({
          week: `Week ${w}`,
          weekNum: w,
          label: `${w}, ${endEpiYear}`,
          cases: pt.cases,
          deaths: pt.deaths,
          cfr: ptCfr,
        });
      }

      items.push({
        id: `country-${c.name}`,
        name: c.name,
        cases: cCases,
        deaths: cDeaths,
        cfr: cCfr,
        trend: countryTrend,
        hasData: cCases > 0 || cDeaths > 0 || countryTrend.some((t) => t.cases > 0 || t.deaths > 0),
        fillPercent: maxScopeCases > 0 ? Math.min(100, (cCases / maxScopeCases) * 100) : 0,
      });
    });

    return items;
  }, [data, kpiCases, kpiDeaths, kpiCfr, mapCountries, startEpiWeek, endEpiWeek, endEpiYear, selectedRegionCountry]);

  // Surveillance Location Summary (Heatmap Matrix per MMWR Epi Week 1-43) matching Image 2
  const matrixWeeks = useMemo(() => {
    return Array.from({ length: endEpiWeek - startEpiWeek + 1 }, (_, i) => startEpiWeek + i);
  }, [startEpiWeek, endEpiWeek]);

  const heatmapMatrixData = useMemo(() => {
    const byCountry = data?.by_country || [];
    return ASEAN_COUNTRIES_INFO.map((c) => {
      const match = byCountry.find((item) => sameCountry(item.name, c.name));
      const cCases = match ? match.cases : 0;
      const cDeaths = match ? match.deaths : 0;
      const realWeekly = Array.isArray(match?.weekly) ? match.weekly : [];

      const weekMap = new Map<number, { cases: number; deaths: number }>();
      realWeekly.forEach((pt: any) => {
        weekMap.set(Number(pt.week), {
          cases: Number(pt.cases) || 0,
          deaths: Number(pt.deaths) || 0,
        });
      });

      const weeks = matrixWeeks.map((wNum) => {
        const pt = weekMap.get(wNum) || { cases: 0, deaths: 0 };
        return {
          week: wNum,
          cases: pt.cases,
          deaths: pt.deaths,
        };
      });

      return {
        country: c.name,
        iso: c.iso,
        totalCases: cCases,
        totalDeaths: cDeaths,
        weeks,
      };
    });
  }, [data?.by_country, matrixWeeks]);

  // Filtered lists for modals
  const filteredDiseases = useMemo(() => {
    if (!diseaseSearch.trim()) return diseaseOptions;
    const q = diseaseSearch.toLowerCase().trim();
    return diseaseOptions.filter((d) => d.toLowerCase().includes(q));
  }, [diseaseOptions, diseaseSearch]);

  const allRegionCountryOptions = useMemo(() => {
    return [
      { category: "Region Scope", name: "ASEAN (11)" },
      { category: "Region Scope", name: "ASEAN+3 (14)" },
      { category: "Region Scope", name: "Global" },
      ...countryOptions.map((c) => ({ category: "Member State", name: c })),
    ];
  }, [countryOptions]);

  const filteredRegionCountries = useMemo(() => {
    if (!countrySearch.trim()) return allRegionCountryOptions;
    const q = countrySearch.toLowerCase().trim();
    return allRegionCountryOptions.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
  }, [allRegionCountryOptions, countrySearch]);

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-[#f8f9fc] text-[#191c1e]">
      {/* ========================================================= */}
      {/* 1. FIXED HEADER (IDENTICAL & CONSISTENT WITH DESIGN)       */}
      {/* ========================================================= */}
      <header className="flex-shrink-0 z-40 bg-gradient-to-r from-[#003396] via-[#003c87] to-[#0052b4] text-white shadow-md border-b-2 border-[#C1A74F]/40 select-none pt-[env(safe-area-inset-top,0px)]">
        <div className="w-full px-3.5 py-2.5 flex items-center justify-between">
          {/* Left: Back Button & Emblem */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full bg-white p-0.5 shadow-sm border border-[#C1A74F]/70 flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/mobile/assets/images/icon_abvc.jpg"
                  alt="Logo ABVC"
                  width={28}
                  height={28}
                  className="rounded-full object-contain"
                  priority
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-white"></span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-black tracking-tight leading-none text-white drop-shadow-xs">
                  ABVC Surveillance
                </span>
                <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest mt-0.5">
                  INDICATOR-BASED SURVEILLANCE
                </span>
              </div>
            </div>
          </div>

          {/* Right: Status Pill */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-extrabold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>IBS Active</span>
            </div>
          </div>
        </div>

        {/* Modular Arrow Navigator */}
        <div className="w-full px-2 py-1.5 bg-black/15 border-t border-white/10 flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevTab}
            disabled={currentIndex === 0}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center text-white transition-all flex-shrink-0 shadow-xs"
            aria-label="Previous Module"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={tabsContainerRef}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-1"
          >
            {ibsSubTabs.map((tab) => {
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  type="button"
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white text-[#003396] shadow-sm scale-102"
                      : "bg-white/10 text-white/85 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNextTab}
            disabled={currentIndex === ibsSubTabs.length - 1}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center text-white transition-all flex-shrink-0 shadow-xs"
            aria-label="Next Module"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. NON-SCROLLABLE MAIN CONTENT AREA                       */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col justify-between p-2.5 sm:p-3 overflow-hidden space-y-1.5">
        {/* ======================================================= */}
        {/* SUB-MODULE 1: OVERVIEW                                 */}
        {/* ======================================================= */}
        {activeSubTab === "overview" && (
          <div className="w-full h-full flex flex-col justify-between space-y-1.5 animate-in fade-in duration-150 overflow-hidden">
            {/* Title Section & Choice Switcher */}
            <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-[#E2E8F0] shadow-xs space-y-1.5 flex-shrink-0">
              <div>
                <h1 className="text-xs sm:text-sm font-black text-[#003396] uppercase tracking-tight">
                  ABVC DATA CRAWLING
                </h1>
                <p className="text-[9px] text-[#737784] font-medium leading-tight">
                  Epidemiological surveillance, outbreak signals, and case trends across ASEAN member states
                </p>
              </div>

              {/* EBS / IBS Switcher */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => onNavigateModule("ebs")}
                  className="h-7.5 px-2 rounded-xl bg-white hover:bg-[#f8f9fc] border border-[#E2E8F0] text-[#424752] hover:text-[#003396] text-[9.5px] font-extrabold uppercase tracking-tight transition-colors flex items-center justify-center text-center cursor-pointer"
                >
                  <span>Event-Based Surveillance</span>
                </button>
                <div className="h-7.5 px-2 rounded-xl bg-[#003396] text-white text-[9.5px] font-black uppercase tracking-tight shadow-xs flex items-center justify-center text-center">
                  <span>Indicator-Based Surveillance</span>
                </div>
              </div>
            </div>

            {/* Filter Section (Faithful to NLP Prototype) */}
            <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-[#E2E8F0] shadow-xs space-y-1.5 flex-shrink-0">
              {/* Header */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center text-[#003396]">
                    <Filter className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-black text-[#003396] uppercase tracking-wider block leading-none">
                      INDICATOR-BASED SURVEILLANCE FILTER
                    </span>
                    <span className="text-[8px] text-[#737784] font-medium block">
                      Figures cover EW{startEpiWeek} — EW{endEpiWeek} ({startEpiYear})
                    </span>
                  </div>
                </div>
                <span className="text-[8px] font-extrabold text-[#003396] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  EW{startEpiWeek} – EW{endEpiWeek}, {startEpiYear} ({endEpiWeek - startEpiWeek + 1} Wk)
                </span>
              </div>

              {/* Grid 1: Diseases & Region/Country */}
              <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
                {/* Field 1: DISEASES (MULTI-SELECT) */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-[8px] font-extrabold text-[#737784] uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Bug className="w-2.5 h-2.5 text-red-500" />
                      Diseases (Multi)
                    </span>
                    {draftDiseases.length > 0 && (
                      <span className="text-[7.5px] font-black text-[#003396] bg-blue-100/60 px-1 rounded">
                        {draftDiseases.length}
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsDiseaseModalOpen(true)}
                    className="w-full h-7 px-2 bg-[#f8f9fc] hover:bg-white focus:bg-white border border-[#E2E8F0] focus:border-[#003396] rounded-lg text-left flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="font-bold text-slate-800 text-[9.5px] truncate pr-1">
                      {draftDiseases.length === 0
                        ? "All Diseases"
                        : draftDiseases.length === 1
                        ? draftDiseases[0]
                        : `${draftDiseases[0]} (+${draftDiseases.length - 1})`}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>
                </div>

                {/* Field 2: REGION / COUNTRY */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-[8px] font-extrabold text-[#737784] uppercase flex items-center gap-1">
                    <Globe2 className="w-2.5 h-2.5 text-blue-500" />
                    Region / Country
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCountryModalOpen(true)}
                    className="w-full h-7 px-2 bg-[#f8f9fc] hover:bg-white focus:bg-white border border-[#E2E8F0] focus:border-[#003396] rounded-lg text-left flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="font-bold text-slate-800 text-[9.5px] truncate pr-1">
                      {draftRegionCountry}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Grid 2: Start Week, End Week, & Action Buttons */}
              <div className="grid grid-cols-4 gap-1.5 text-[9.5px] items-end">
                {/* Start Week */}
                <div>
                  <label className="block text-[8px] font-extrabold text-[#737784] uppercase truncate">
                    Start Week
                  </label>
                  <select
                    value={draftStartWeek}
                    onChange={(e) => setDraftStartWeek(Number(e.target.value))}
                    className="w-full h-7 px-1.5 bg-[#f8f9fc] border border-[#E2E8F0] rounded-lg font-bold text-slate-800 text-[9.5px] outline-none cursor-pointer"
                  >
                    {Array.from({ length: 43 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>
                        Week {w}
                      </option>
                    ))}
                  </select>
                </div>

                {/* End Week */}
                <div>
                  <label className="block text-[8px] font-extrabold text-[#737784] uppercase truncate">
                    End Week
                  </label>
                  <select
                    value={draftEndWeek}
                    onChange={(e) => setDraftEndWeek(Number(e.target.value))}
                    className="w-full h-7 px-1.5 bg-[#f8f9fc] border border-[#E2E8F0] rounded-lg font-bold text-slate-800 text-[9.5px] outline-none cursor-pointer"
                  >
                    {Array.from({ length: 43 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>
                        Week {w}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Apply Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleApplyFilter}
                    disabled={filterLoading}
                    className="w-full h-7 rounded-lg bg-[#003396] hover:bg-[#002266] active:scale-95 text-white font-black text-[9.5px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{filterLoading ? "..." : "APPLY"}</span>
                  </button>
                </div>

                {/* Reset Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    disabled={filterLoading}
                    className="w-full h-7 rounded-lg bg-[#f8f9fc] hover:bg-[#eceef0] active:scale-95 border border-[#E2E8F0] text-[#737784] font-bold text-[9.5px] flex items-center justify-center transition cursor-pointer"
                    title="Reset to Defaults"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scope Summary Pill (Image match: ● Disease: Dengue  Scope: ASEAN...) */}
            <div className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-[9px] text-[#003396] font-bold flex-shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#003396] shrink-0"></span>
                <span className="truncate">
                  Disease:{" "}
                  <span className="font-black">
                    {selectedDiseases.length === 0
                      ? "All Diseases"
                      : selectedDiseases.length === 1
                      ? selectedDiseases[0]
                      : `${selectedDiseases[0]} (+${selectedDiseases.length - 1} more)`}
                  </span>
                </span>
                <span className="text-blue-300">|</span>
                <span className="truncate">
                  Scope: <span className="font-black">{selectedRegionCountry}</span>
                </span>
              </div>
              <span className="text-[8.5px] text-[#003396]/80 shrink-0 ml-1">
                W{startEpiWeek} — W{endEpiWeek} ({startEpiYear})
              </span>
            </div>

            {/* 3 Summary Metric Cards */}
            <div className="grid grid-cols-3 gap-1.5 flex-shrink-0">
              {/* Card 1: Cumulative Case */}
              <div className="bg-white rounded-xl p-2 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-bold text-[#737784] uppercase block leading-tight">
                    CUMULATIVE CASE
                  </span>
                  <span className="text-lg font-black text-[#003396] tracking-tight block mt-0.5">
                    {kpiCases.toLocaleString()}
                  </span>
                </div>
                <div className="text-[7.5px] text-emerald-600 font-bold pt-0.5 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span>Scope Live</span>
                  <span className="truncate max-w-[65px]">
                    {selectedDiseases.length === 0
                      ? "All"
                      : selectedDiseases.length === 1
                      ? selectedDiseases[0]
                      : `${selectedDiseases.length} Dis.`}
                  </span>
                </div>
              </div>

              {/* Card 2: Cumulative Death */}
              <div className="bg-white rounded-xl p-2 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-bold text-[#737784] uppercase block leading-tight">
                    CUMULATIVE DEATH
                  </span>
                  <span className="text-lg font-black text-[#BA1A1A] tracking-tight block mt-0.5">
                    {kpiDeaths.toLocaleString()}
                  </span>
                </div>
                <div className="text-[7.5px] text-slate-500 font-bold pt-0.5 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span>Fatality</span>
                  <span>Verified</span>
                </div>
              </div>

              {/* Card 3: CFR */}
              <div className="bg-white rounded-xl p-2 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-bold text-[#737784] uppercase block leading-tight">
                    CFR
                  </span>
                  <span className="text-lg font-black text-emerald-700 tracking-tight block mt-0.5">
                    {kpiCfr.toFixed(2)}%
                  </span>
                </div>
                <div className="text-[7.5px] text-[#737784] font-bold pt-0.5 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span>Fatality Rate</span>
                  <span>Stable</span>
                </div>
              </div>
            </div>

            {/* Country Burden Table (Prototype Image Match) */}
            <div className="flex-1 bg-white rounded-2xl p-2 border border-[#E2E8F0] shadow-xs flex flex-col justify-between overflow-hidden">
              <div className="text-[9px] font-black text-slate-700 pb-1 border-b border-slate-100 flex items-center justify-between uppercase">
                <span>Country / State</span>
                <div className="flex items-center gap-6">
                  <span>Reported Case</span>
                  <span>Reported Death</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-50">
                {mapCountries.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedCountry(c.name);
                      setActiveSubTab("map");
                    }}
                    className={`flex items-center justify-between py-1 px-1 rounded-lg text-[9.5px] cursor-pointer transition ${
                      selectedCountry === c.name
                        ? "bg-blue-50 font-bold"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                      {c.name}
                    </span>
                    <div className="flex items-center gap-6">
                      <span className="text-[#003396] font-extrabold w-16 text-right">
                        {c.cases > 0 ? c.cases.toLocaleString() : "-"}
                      </span>
                      <span className="text-slate-500 w-12 text-right">
                        {c.deaths ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[8.5px] text-slate-500 font-semibold">
                <span>Total Active Scope</span>
                <span className="text-[#003396] font-black">
                  {kpiCases.toLocaleString()} cases • {kpiDeaths} deaths
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* SUB-MODULE 2: SPATIAL OUTBREAK MAP                      */}
        {/* ======================================================= */}
        {activeSubTab === "map" && (
          <div className="w-full h-full flex flex-col justify-between space-y-1.5 animate-in fade-in duration-150 overflow-hidden">
            {/* Header */}
            <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-[#E2E8F0] shadow-xs flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xs font-black text-[#003396] uppercase truncate max-w-[280px]">
                  SPATIAL OUTBREAK MAP ({selectedDiseases.length > 0 ? selectedDiseases.join(", ").toUpperCase() : "ALL DISEASES"} • {selectedRegionCountry.toUpperCase()})
                </h2>
                <span className="text-[8.5px] text-[#737784]">
                  Range: Week {startEpiWeek} — Week {endEpiWeek} ({startEpiYear}) • Tap country polygon to inspect
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#003396] text-[9px] font-bold">
                Choropleth
              </span>
            </div>

            {/* Map Frame Area */}
            <div className="flex-1 w-full overflow-hidden relative rounded-2xl flex flex-col gap-1.5">
              <div className="flex-1 min-h-[220px] relative rounded-2xl overflow-hidden border border-[#E2E8F0]">
                <AseanSurveillanceMapMobile
                  mode="ibs"
                  countries={mapCountries}
                  locations={mapLocations}
                  selectedCountry={selectedCountry}
                  onSelectCountry={setSelectedCountry}
                  heightClass="w-full h-full"
                />
              </div>

              {/* Country Table Breakdown */}
              <div className="h-28 bg-white rounded-xl p-2 border border-[#E2E8F0] shadow-xs flex flex-col justify-between overflow-hidden flex-shrink-0">
                <div className="text-[9px] font-black text-[#737784] pb-1 border-b border-slate-100 flex items-center justify-between uppercase">
                  <span>Country Breakdown</span>
                  <div className="flex items-center gap-6">
                    <span>Reported Cases</span>
                    <span>Reported Deaths</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 py-0.5">
                  {mapCountries.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedCountry(c.name)}
                      className={`flex items-center justify-between p-1 rounded-lg text-[9.5px] cursor-pointer transition-colors ${
                        selectedCountry === c.name
                          ? "bg-blue-100/70 font-bold"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-slate-800 font-medium truncate max-w-[150px]">
                        {c.name}
                      </span>
                      <div className="flex items-center gap-6">
                        <span className="text-[#003396] font-bold w-14 text-right">
                          {c.cases > 0 ? c.cases.toLocaleString() : "-"}
                        </span>
                        <span className="text-slate-500 w-8 text-right">
                          {c.deaths ?? 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[8.5px] text-slate-500 font-semibold">
                  <span>Total Active Scope</span>
                  <span className="text-[#003396] font-extrabold">
                    {kpiCases.toLocaleString()} cases • {kpiDeaths} deaths
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* SUB-MODULE 3: EPI TRENDS & CFR                         */}
        {/* ======================================================= */}
        {activeSubTab === "trends" && (
          <div className="w-full h-full flex flex-col space-y-1.5 animate-in fade-in duration-150 overflow-hidden">
            {/* Top Toggle Header */}
            <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xs font-black text-[#003396] uppercase">
                  EPIDEMIOLOGICAL TRENDS &amp; CFR
                </h2>
                <span className="text-[9px] text-[#737784]">
                  {selectedDiseases.length > 0 ? selectedDiseases.join(", ") : "All Diseases"} weekly distribution across ASEAN
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowExtendedTrends(!showExtendedTrends)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#003396] text-white text-[9.5px] font-bold shadow-xs hover:bg-[#002266] transition cursor-pointer"
              >
                <span>{showExtendedTrends ? "Hide Trends" : "Show Trends"}</span>
                {showExtendedTrends ? (
                  <ChevronUp className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                )}
              </button>
            </div>

            {/* List of Country Trends matching Image 1 */}
            {showExtendedTrends ? (
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
                {individualCountryTrends.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-xs flex flex-col space-y-2"
                  >
                    {/* Country Header Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CountryFlag countryName={item.name} shape="rounded" size="sm" />
                        <div>
                          <h3 className="text-xs font-black text-slate-900 leading-none">
                            {item.name}
                          </h3>
                          <span className="text-[8.5px] text-slate-400 font-medium">
                            Weeks {startEpiWeek}–{endEpiWeek}, {endEpiYear}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black text-slate-900 leading-none block">
                          {item.cases.toLocaleString()}
                        </span>
                        <span className="text-[8px] text-slate-400 font-semibold block">
                          Reported Cases
                        </span>
                      </div>
                    </div>

                    {/* Proportional Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#003396] transition-all"
                        style={{
                          width: `${Math.max(item.cases > 0 ? 3 : 0, item.fillPercent)}%`,
                        }}
                      />
                    </div>

                    {/* 2 Charts: Report Cases & CFR Data */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                      {/* Chart 1: Report Cases */}
                      <div className="bg-[#f8f9fc] rounded-xl p-2 border border-slate-200/70 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/50">
                          <span className="text-[9.5px] font-black text-slate-800">
                            Report Cases
                          </span>
                          <div className="flex items-center gap-2 text-[8.5px] font-bold">
                            <span className="text-[#0284c7] flex items-center gap-1">
                              <span className="w-2.5 h-0.5 bg-[#0284c7] rounded-full inline-block" />
                              Cases
                            </span>
                            <span className="text-[#7c3aed] flex items-center gap-1">
                              <span className="w-2.5 h-0.5 bg-[#7c3aed] rounded-full inline-block" />
                              Deaths
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={item.trend}
                              margin={{ top: 5, right: 5, left: -25, bottom: 15 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                              <XAxis
                                dataKey="label"
                                angle={-45}
                                textAnchor="end"
                                interval={Math.ceil(item.trend.length / 6)}
                                tick={{ fontSize: 7.5, fill: "#64748b" }}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fontSize: 8, fill: "#64748b" }}
                                tickLine={false}
                                tickFormatter={(v) => formatCompact(v)}
                                domain={[0, "auto"]}
                              />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                  fontSize: "9.5px",
                                  padding: "4px 8px",
                                }}
                                formatter={(val: any, name: any) => [
                                  `${Number(val).toLocaleString()} ${name}`,
                                  name,
                                ]}
                              />
                              <Line
                                type="monotone"
                                dataKey="cases"
                                name="Cases"
                                stroke="#0284C7"
                                strokeWidth={1.8}
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey="deaths"
                                name="Deaths"
                                stroke="#7C3AED"
                                strokeWidth={1.8}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Chart 2: CFR Data */}
                      <div className="bg-[#f8f9fc] rounded-xl p-2 border border-slate-200/70 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/50">
                          <span className="text-[9.5px] font-black text-slate-800">
                            CFR Data
                          </span>
                          <div className="flex items-center gap-1 text-[8.5px] font-bold text-[#0d9488]">
                            <span className="w-2 h-0.5 bg-[#0d9488] rounded-full inline-block" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] inline-block" />
                            <span className="w-2 h-0.5 bg-[#0d9488] rounded-full inline-block" />
                            <span>CFR</span>
                          </div>
                        </div>
                        <div className="w-full h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={item.trend}
                              margin={{ top: 5, right: 5, left: -25, bottom: 15 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                              <XAxis
                                dataKey="label"
                                angle={-45}
                                textAnchor="end"
                                interval={Math.ceil(item.trend.length / 6)}
                                tick={{ fontSize: 7.5, fill: "#64748b" }}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fontSize: 8, fill: "#64748b" }}
                                tickLine={false}
                                tickFormatter={(v) => `${v}%`}
                                domain={[0, "auto"]}
                              />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                  fontSize: "9.5px",
                                  padding: "4px 8px",
                                }}
                                formatter={(val: any) => [`${Number(val).toFixed(2)}%`, "CFR"]}
                              />
                              <Line
                                type="monotone"
                                dataKey="cfr"
                                stroke="#0D9488"
                                strokeWidth={1.8}
                                dot={{ r: 1.5, fill: "#0D9488" }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-400">
                  Trends are currently hidden. Tap "Show Trends" above to expand.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* SUB-MODULE 4: SURVEILLANCE LOCATION SUMMARY (HEATMAP)   */}
        {/* ======================================================= */}
        {activeSubTab === "matrix" && (
          <div className="w-full h-full flex flex-col space-y-1.5 animate-in fade-in duration-150 overflow-hidden">
            {/* Header Section matching Image 2 */}
            <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-xs space-y-2 shrink-0">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                    Surveillance Location Summary
                  </h2>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-emerald-700">
                    SEE EPI WEEK MATRIX
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] leading-relaxed text-slate-500">
                  Provides a concise overview of mapped locations, geographic distribution, affected areas, and emerging spatial patterns across monitored ASEAN countries per MMWR Epidemiological Week ({startEpiWeek}–{endEpiWeek}, {endEpiYear})
                </p>
              </div>

              {/* Controls: Metric Switcher and Matrix View Pill */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 text-[9.5px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setMatrixMetric("cases")}
                    className={`flex items-center gap-1 rounded-lg px-2 py-0.5 transition-all ${
                      matrixMetric === "cases"
                        ? "bg-white text-blue-700 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Activity className="h-3 w-3" />
                    Cases
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatrixMetric("deaths")}
                    className={`flex items-center gap-1 rounded-lg px-2 py-0.5 transition-all ${
                      matrixMetric === "deaths"
                        ? "bg-white text-rose-700 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Skull className="h-3 w-3" />
                    Deaths
                  </button>
                </div>

                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 text-[9.5px] font-semibold">
                  <div className="flex items-center gap-1 rounded-lg px-2 py-0.5 bg-white text-[#0060A9] shadow-xs font-bold">
                    <Layers className="h-3 w-3" />
                    Matrix View
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix View Box */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar">
                <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/95 text-[9px] font-black uppercase tracking-wider text-slate-600 sticky top-0 z-20">
                      <th className="sticky left-0 z-30 bg-slate-50/95 px-3 py-2 shadow-xs min-w-[130px] border-r border-slate-200">
                        ASEAN MEMBER COUNTRIES
                      </th>
                      {matrixWeeks.map((w) => (
                        <th
                          key={w}
                          className="px-1 py-2 text-center whitespace-nowrap min-w-[38px] text-[8.5px] border-r border-slate-100"
                        >
                          EW {String(w).padStart(2, "0")}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-right whitespace-nowrap min-w-[70px]">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {heatmapMatrixData.map((row) => {
                      const totalVal = matrixMetric === "cases" ? row.totalCases : row.totalDeaths;
                      return (
                        <tr key={row.country} className="group hover:bg-slate-50/70 transition-colors">
                          {/* Sticky Country Header */}
                          <td className="sticky left-0 z-10 bg-white px-3 py-1.5 shadow-xs group-hover:bg-slate-50/90 border-r border-slate-200">
                            <div className="flex items-center gap-2">
                              <CountryFlag countryName={row.country} shape="rounded" size="xs" />
                              <div className="min-w-0">
                                <span className="block font-bold text-slate-900 text-[10px] truncate max-w-[95px]">
                                  {row.country}
                                </span>
                                <span className="block text-[8px] font-semibold text-slate-400">
                                  ISO: {row.iso}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 43 Week Heatmap Tiles */}
                          {row.weeks.map((w) => {
                            const val = matrixMetric === "cases" ? w.cases : w.deaths;
                            const hasVal = val > 0;
                            return (
                              <td
                                key={w.week}
                                onClick={() =>
                                  setSelectedMatrixCell({
                                    country: row.country,
                                    iso: row.iso,
                                    week: w.week,
                                    cases: w.cases,
                                    deaths: w.deaths,
                                  })
                                }
                                className="p-0.5 text-center cursor-pointer border-r border-slate-50"
                              >
                                <div
                                  className={`w-8 h-7 mx-auto rounded-md flex items-center justify-center text-[9px] transition-transform active:scale-90 ${
                                    hasVal
                                      ? "bg-[#ef4444] text-white font-extrabold shadow-xs"
                                      : "bg-slate-100/70 text-slate-300 font-normal hover:bg-slate-200/60"
                                  }`}
                                >
                                  {hasVal ? formatCompact(val) : "-"}
                                </div>
                              </td>
                            );
                          })}

                          {/* Row Total */}
                          <td className="px-3 py-1.5 text-right font-black text-slate-900 text-[10px]">
                            {formatCompact(totalVal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Matrix Footer */}
              <div className="px-3 py-1.5 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
                <span>
                  {selectedMatrixCell
                    ? `${selectedMatrixCell.country} • EW ${selectedMatrixCell.week}: ${selectedMatrixCell.cases.toLocaleString()} cases, ${selectedMatrixCell.deaths} deaths`
                    : "Tap any cell to inspect weekly epidemiological indicators"}
                </span>
                <span className="font-bold text-[#003396]">
                  {matrixWeeks.length} Weeks Monitored
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. FIXED BOTTOM NAVIGATION WITH FLOATING ACTIVE BUTTON    */}
      {/* ========================================================= */}
      <ModuleFooterNav activeTab="ibs" onTabChange={onNavigateModule} />

      {/* ========================================================= */}
      {/* 4. MODALS FOR MOBILE DISEASE & REGION/COUNTRY SELECTION   */}
      {/* ========================================================= */}
      {/* Disease Picker Modal (Multi-Select) */}
      {isDiseaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-2.5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-[#003396] uppercase flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-red-500" />
                  Select Disease(s)
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {draftDiseases.length} disease{draftDiseases.length === 1 ? "" : "s"} selected
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDiseaseModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions: Select All & Clear */}
            <div className="flex items-center justify-between text-[10px] font-bold px-1">
              <button
                type="button"
                onClick={() => setDraftDiseases([...diseaseOptions])}
                className="text-[#003396] hover:underline"
              >
                Select All ({diseaseOptions.length})
              </button>
              <button
                type="button"
                onClick={() => setDraftDiseases([])}
                className="text-slate-400 hover:text-slate-600"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search disease..."
                value={diseaseSearch}
                onChange={(e) => setDiseaseSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#003396]"
              />
            </div>

            {/* Multi-select List */}
            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100 max-h-[45vh]">
              {filteredDiseases.map((d) => {
                const isSelected = draftDiseases.some(
                  (sel) => sel.toLowerCase() === d.toLowerCase()
                );
                return (
                  <div
                    key={d}
                    onClick={() => {
                      if (isSelected) {
                        setDraftDiseases(
                          draftDiseases.filter(
                            (sel) => sel.toLowerCase() !== d.toLowerCase()
                          )
                        );
                      } else {
                        setDraftDiseases([...draftDiseases, d]);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                      isSelected
                        ? "bg-blue-50/80 text-[#003396]"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[#003396] border-[#003396] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{d}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Done button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDiseaseModalOpen(false)}
                className="w-full h-9 rounded-xl bg-[#003396] hover:bg-[#002266] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>
                  Done ({draftDiseases.length === 0 ? "All Diseases" : `${draftDiseases.length} Selected`})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Region / Country Picker Modal */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-2.5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-[#003396] uppercase flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-blue-500" />
                  Select Region or Country
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Filter by regional scope or individual member country
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCountryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search region or country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#003396]"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100 max-h-[50vh]">
              {filteredRegionCountries.map((c) => {
                const isSelected = draftRegionCountry.toLowerCase() === c.name.toLowerCase();
                return (
                  <div
                    key={c.name}
                    onClick={() => {
                      setDraftRegionCountry(c.name);
                      setIsCountryModalOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                      isSelected
                        ? "bg-blue-50 text-[#003396]"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div>
                      <span>{c.name}</span>
                      <span className="block text-[8.5px] text-slate-400 font-normal">
                        {c.category}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#003396]" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
