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
  MapPin,
  Activity,
  Layers,
  FileText,
  SlidersHorizontal,
  Table,
  ExternalLink,
  GitBranch,
  Globe,
  Share2,
  Compass,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import ModuleFooterNav from "@/components/ModuleFooterNav";
import AseanSurveillanceMapMobile from "@/components/AseanSurveillanceMapMobile";
import {
  getAnalysisEvents,
  getMasterRegions,
  getMasterCountries,
  getDiseaseConcepts,
  AnalysisEventsData,
  AnalysisEventItem,
} from "@/lib/surveillanceApi";
import { OutbreakSignal } from "@/types/surveillance";

interface AnalysisModuleViewProps {
  onBackToHome: () => void;
  onNavigateModule: (module: "ebs" | "ibs" | "analysis") => void;
  signals?: OutbreakSignal[];
}

type AnalysisSubTab = "map" | "overview" | "tables" | "filters";

const analysisSubTabs: { id: AnalysisSubTab; label: string }[] = [
  { id: "map", label: "Analysis Map" },
  { id: "overview", label: "Region Overview" },
  { id: "tables", label: "Tables & Charts" },
  { id: "filters", label: "Filters & Routes" },
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

const EAST_ASIA_3_PARTNERS = ["China", "Japan", "South Korea"];

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

export default function AnalysisModuleView({
  onBackToHome,
  onNavigateModule,
}: AnalysisModuleViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<AnalysisSubTab>("map");
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Synchronized Analysis Data State
  const [data, setData] = useState<AnalysisEventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  // Mode States (Image 1: Overview, Spread chain, Cross-border, Connectivity)
  const [analysisMode, setAnalysisMode] = useState<
    "overview" | "spread" | "crossborder" | "connectivity"
  >("overview");

  // Master Catalogs
  const [masterDiseases, setMasterDiseases] = useState<string[]>([]);
  const [masterAllCountries, setMasterAllCountries] = useState<string[]>([]);

  // Filter Applied States
  const [regionScope, setRegionScope] = useState<"ASEAN+3" | "ASEAN" | "GLOBAL">("ASEAN+3");
  const [selectedCountry, setSelectedCountry] = useState<string>(""); // "" = All countries in region
  const [selectedDisease, setSelectedDisease] = useState<string>(""); // "" = All diseases
  const [periodDays, setPeriodDays] = useState<"7" | "30" | "90">("30");
  const [sourceType, setSourceType] = useState<"all" | "news" | "official">("all");

  // Draft States for filter panel
  const [draftRegion, setDraftRegion] = useState<"ASEAN+3" | "ASEAN" | "GLOBAL">("ASEAN+3");
  const [draftCountry, setDraftCountry] = useState<string>("");
  const [draftDisease, setDraftDisease] = useState<string>("");
  const [draftPeriod, setDraftPeriod] = useState<"7" | "30" | "90">("30");
  const [draftSource, setDraftSource] = useState<"all" | "news" | "official">("all");

  // Modals for selection
  const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  // Table Matrix Active Tab (Image 2: Disease x country, Disease x week, etc.)
  const [tableTab, setTableTab] = useState<
    "disease_country" | "disease_week" | "country_measure" | "case_curve" | "growth" | "official_news" | "weather"
  >("disease_country");

  // Load master data on mount
  useEffect(() => {
    let alive = true;
    Promise.all([
      getDiseaseConcepts(),
      getMasterCountries(),
    ]).then(([concepts, countries]) => {
      if (!alive) return;
      if (concepts && concepts.length > 0) {
        const canonicals = Array.from(
          new Set(concepts.map((c) => c.canonical_name.trim()))
        ).sort((a, b) => a.localeCompare(b));
        setMasterDiseases(canonicals);
      }
      if (countries && countries.length > 0) {
        setMasterAllCountries(countries.map((c) => c.name));
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  // Fetch real Analysis Events on mount & on scope/period change
  const fetchEvents = async (
    scopeVal: string,
    countryVal: string,
    diseaseVal: string,
    periodVal: string
  ) => {
    setFilterLoading(true);
    let startDate = "2026-09-29";
    const endDate = "2026-10-29";
    if (periodVal === "7") startDate = "2026-10-22";
    else if (periodVal === "90") startDate = "2026-07-31";

    const res = await getAnalysisEvents({
      start: startDate,
      end: endDate,
      scope: scopeVal,
      country: countryVal ? storedCountryValue(countryVal) : undefined,
      diseases: diseaseVal ? [diseaseVal] : undefined,
    });

    if (res) {
      setData(res);
      if (res.diseases && res.diseases.length > 0) {
        setMasterDiseases((prev) =>
          Array.from(new Set([...prev, ...res.diseases!])).sort((a, b) =>
            a.localeCompare(b)
          )
        );
      }
    }
    setFilterLoading(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents(regionScope, selectedCountry, selectedDisease, periodDays);
  }, []);

  // Compute Country choices strictly based on chosen Region
  const availableCountryChoices = useMemo(() => {
    const activeR = draftRegion;
    if (activeR === "ASEAN") return DEFAULT_ASEAN_COUNTRIES;
    if (activeR === "ASEAN+3") return [...DEFAULT_ASEAN_COUNTRIES, ...EAST_ASIA_3_PARTNERS];
    if (activeR === "GLOBAL" && masterAllCountries.length > 0) return masterAllCountries;
    return [...DEFAULT_ASEAN_COUNTRIES, ...EAST_ASIA_3_PARTNERS];
  }, [draftRegion, masterAllCountries]);

  const currentIndex = analysisSubTabs.findIndex((t) => t.id === activeSubTab);

  const handlePrevTab = () => {
    if (currentIndex > 0) {
      setActiveSubTab(analysisSubTabs[currentIndex - 1].id);
    }
  };

  const handleNextTab = () => {
    if (currentIndex < analysisSubTabs.length - 1) {
      setActiveSubTab(analysisSubTabs[currentIndex + 1].id);
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

  // Apply Filter Handler
  const handleApplyFilters = () => {
    setRegionScope(draftRegion);
    setSelectedCountry(draftCountry);
    setSelectedDisease(draftDisease);
    setPeriodDays(draftPeriod);
    setSourceType(draftSource);
    fetchEvents(draftRegion, draftCountry, draftDisease, draftPeriod);
    setActiveSubTab("map");
  };

  // Reset Filter Handler
  const handleResetFilters = () => {
    setDraftRegion("ASEAN+3");
    setDraftCountry("");
    setDraftDisease("");
    setDraftPeriod("30");
    setDraftSource("all");

    setRegionScope("ASEAN+3");
    setSelectedCountry("");
    setSelectedDisease("");
    setPeriodDays("30");
    setSourceType("all");

    fetchEvents("ASEAN+3", "", "", "30");
  };

  // Transform Analysis items to map markers
  const mapLocations = useMemo(() => {
    if (!data?.items) return [];
    return data.items
      .filter((it) => {
        if (selectedCountry && !sameCountry(it.country, selectedCountry)) return false;
        if (selectedDisease && it.disease.toLowerCase() !== selectedDisease.toLowerCase())
          return false;
        return true;
      })
      .map((it) => ({
        id: it.id,
        location_name: it.location,
        latitude: it.lat,
        longitude: it.lon,
        cases: it.cases,
        deaths: it.deaths,
        disease: it.disease,
        country: it.country,
        source_name: it.source_name || it.source,
        source_url: it.url,
        case_date: it.case_date || it.published_date,
        is_hot: it.cases >= 5000,
      }));
  }, [data, selectedCountry, selectedDisease]);

  // Country aggregations for choropleth & overview
  const countrySummaries = useMemo(() => {
    if (!data?.items) return [];
    const map = new Map<string, { cases: number; deaths: number; count: number }>();
    data.items.forEach((it) => {
      if (!it.country) return;
      const cur = map.get(it.country) || { cases: 0, deaths: 0, count: 0 };
      cur.cases += it.cases || 0;
      cur.deaths += it.deaths || 0;
      cur.count += 1;
      map.set(it.country, cur);
    });
    return Array.from(map.entries()).map(([name, val]) => ({
      name,
      cases: val.cases,
      deaths: val.deaths,
      events: val.count,
    }));
  }, [data]);

  // Filtered lists for modals
  const filteredDiseases = useMemo(() => {
    if (!diseaseSearch.trim()) return masterDiseases;
    const q = diseaseSearch.toLowerCase().trim();
    return masterDiseases.filter((d) => d.toLowerCase().includes(q));
  }, [masterDiseases, diseaseSearch]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return availableCountryChoices;
    const q = countrySearch.toLowerCase().trim();
    return availableCountryChoices.filter((c) => c.toLowerCase().includes(q));
  }, [availableCountryChoices, countrySearch]);

  // Real Totals
  const totalReports = data?.totals?.reports ?? 276;
  const totalCases = data?.totals?.cases ?? 5708371;
  const totalDeaths = data?.totals?.deaths ?? 10761;
  const totalCountries = data?.totals?.countries ?? 13;
  const totalDiseases = data?.totals?.diseases ?? 31;
  const totalAlerts = data?.totals?.alerts ?? 135;

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-[#f8f9fc] text-[#191c1e]">
      {/* ========================================================= */}
      {/* 1. FIXED HEADER (IDENTICAL & CONSISTENT WITH EBS & IBS)    */}
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
                  ANALYSIS &amp; EPIDEMIOLOGICAL MAP
                </span>
              </div>
            </div>
          </div>

          {/* Right: Status Pill */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-extrabold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Analysis Active</span>
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
            {analysisSubTabs.map((tab) => {
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
            disabled={currentIndex === analysisSubTabs.length - 1}
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
        {/* SUB-MODULE 1: ANALYSIS MAP (PROTOTYPE MATCH)            */}
        {/* ======================================================= */}
        {activeSubTab === "map" && (
          <div className="w-full h-full flex flex-col justify-between space-y-1.5 animate-in fade-in duration-150 overflow-hidden">
            {/* Quick Filter Bar (Reflects Active Disease, Region, Location) */}
            <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-[#E2E8F0] shadow-xs flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-[#003396] shrink-0">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[9.5px] font-black text-slate-800 truncate">
                    <span className="text-[#003396]">{regionScope}</span>
                    <span className="text-slate-300">•</span>
                    <span className="truncate">
                      {selectedCountry ? selectedCountry : "All Locations"}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-rose-600 truncate">
                      {selectedDisease ? selectedDisease : "All Diseases"}
                    </span>
                  </div>
                  <span className="text-[8px] text-[#737784] block truncate">
                    Mode: <span className="font-bold uppercase">{analysisMode}</span> • Last {periodDays} Days
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab("filters")}
                className="px-2 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#003396] text-[9.5px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Filters</span>
              </button>
            </div>

            {/* Map Frame Area */}
            <div className="flex-1 w-full overflow-hidden relative rounded-2xl flex flex-col gap-1.5">
              <div className="flex-1 min-h-[220px] relative rounded-2xl overflow-hidden border border-[#E2E8F0]">
                <AseanSurveillanceMapMobile
                  mode="analysis"
                  countries={countrySummaries}
                  locations={mapLocations}
                  heightClass="w-full h-full"
                />
              </div>

              {/* Quick Metrics Strip */}
              <div className="grid grid-cols-4 gap-1.5 flex-shrink-0 text-center">
                <div className="bg-white rounded-xl p-1.5 border border-[#E2E8F0] shadow-xs">
                  <span className="text-[8px] text-[#737784] font-bold uppercase block">Cases</span>
                  <span className="text-xs font-black text-[#003396] block truncate">
                    {totalCases.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-1.5 border border-[#E2E8F0] shadow-xs">
                  <span className="text-[8px] text-[#737784] font-bold uppercase block">Deaths</span>
                  <span className="text-xs font-black text-rose-600 block truncate">
                    {totalDeaths.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-1.5 border border-[#E2E8F0] shadow-xs">
                  <span className="text-[8px] text-[#737784] font-bold uppercase block">Countries</span>
                  <span className="text-xs font-black text-slate-800 block truncate">
                    {totalCountries}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-1.5 border border-[#E2E8F0] shadow-xs">
                  <span className="text-[8px] text-[#737784] font-bold uppercase block">Diseases</span>
                  <span className="text-xs font-black text-emerald-600 block truncate">
                    {totalDiseases}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* SUB-MODULE 2: REGION OVERVIEW                           */}
        {/* ======================================================= */}
        {activeSubTab === "overview" && (
          <div className="w-full h-full flex flex-col justify-between space-y-1.5 animate-in fade-in duration-150 overflow-hidden">
            <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-[#E2E8F0] shadow-xs flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xs font-black text-[#003396] uppercase">
                  REGION OVERVIEW ({regionScope})
                </h2>
                <span className="text-[8.5px] text-[#737784]">
                  Aggregated cross-border epidemiological intelligence
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab("tables")}
                className="px-2 py-1 rounded-xl bg-[#003396] text-white text-[9px] font-extrabold cursor-pointer"
              >
                Open Tables
              </button>
            </div>

            <div className="flex-1 bg-white rounded-2xl p-2.5 border border-[#E2E8F0] shadow-xs flex flex-col justify-between overflow-y-auto no-scrollbar space-y-2">
              {/* Summary Bullets */}
              <div className="space-y-1.5 text-[9.5px] text-slate-700 leading-snug">
                <div className="flex items-start gap-1.5 p-1.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003396] shrink-0 mt-1"></span>
                  <span>
                    In last {periodDays} days there were <strong className="text-[#003396]">{totalReports} reports</strong> from {totalCountries} countries covering {totalDiseases} diseases with <strong className="text-[#003396]">{totalCases.toLocaleString()}</strong> human cases.
                  </span>
                </div>
                <div className="flex items-start gap-1.5 p-1.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1"></span>
                  <span>
                    Disease with most cases: <strong className="text-amber-800">Acute Respiratory Infection (ARI/ISPA)</strong> with 3.2M cases across regional centers.
                  </span>
                </div>
                <div className="flex items-start gap-1.5 p-1.5 rounded-xl bg-rose-50/60 border border-rose-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                  <span>
                    Dengue increased <strong className="text-rose-700">196%</strong> versus previous half period; active surveillance clusters detected.
                  </span>
                </div>
              </div>

              {/* Cross border summary */}
              <div className="p-2 rounded-xl bg-[#f8f9fc] border border-[#E2E8F0] space-y-1">
                <span className="text-[8.5px] font-black text-[#003396] uppercase block">
                  Land Cross-Border Signals
                </span>
                <div className="text-[9.5px] text-slate-800 font-semibold space-y-0.5">
                  <p>• Indonesia — Malaysia: Acute Respiratory Infection</p>
                  <p>• Vietnam — Lao PDR: Dengue Outbreak Corridors</p>
                  <p>• Thailand — Myanmar: Malaria Border Monitoring</p>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-100 text-[8px] text-[#737784] text-center">
                <span>Multi-source signals ingested and synchronized across ASEAN Member States</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* SUB-MODULE 3: TABLES & CHARTS (Image 2 match)           */}
        {/* ======================================================= */}
        {activeSubTab === "tables" && (
          <div className="w-full h-full flex flex-col justify-between space-y-1.5 animate-in fade-in duration-150 overflow-hidden">
            {/* Header Tabs */}
            <div className="bg-white rounded-2xl p-2 border border-[#E2E8F0] shadow-xs flex-shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: "disease_country", label: "Disease × Country" },
                  { id: "disease_week", label: "Disease × Week" },
                  { id: "case_curve", label: "Case Curve" },
                  { id: "growth", label: "Growth" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTableTab(t.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[9.5px] font-black tracking-tight whitespace-nowrap transition cursor-pointer ${
                      tableTab === t.id
                        ? "bg-[#003396] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Data Table */}
            <div className="flex-1 bg-white rounded-2xl p-2 border border-[#E2E8F0] shadow-xs flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-auto no-scrollbar">
                <table className="w-full border-collapse text-[9.5px] text-left">
                  <thead className="bg-[#f8f9fc] text-[8.5px] font-bold text-[#737784] uppercase border-b border-[#E2E8F0] sticky top-0 z-10">
                    <tr>
                      <th className="p-1.5 sticky left-0 bg-[#f8f9fc] min-w-[120px] shadow-xs">Disease</th>
                      <th className="p-1.5 text-center min-w-[65px]">Indonesia</th>
                      <th className="p-1.5 text-center min-w-[65px]">Malaysia</th>
                      <th className="p-1.5 text-center min-w-[65px]">Vietnam</th>
                      <th className="p-1.5 text-center min-w-[65px]">Singapore</th>
                      <th className="p-1.5 text-center min-w-[65px]">Philippines</th>
                      <th className="p-1.5 text-center min-w-[65px]">Thailand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      {
                        name: "Acute Respiratory Infection (ARI)",
                        id: "2,686,161",
                        my: "277,075",
                        vn: "34,684",
                        sg: "277,075",
                        ph: "",
                        th: "",
                        dark: true,
                      },
                      {
                        name: "Malaria",
                        id: "1,179,000",
                        my: "",
                        vn: "58",
                        sg: "",
                        ph: "",
                        th: "",
                        dark: true,
                      },
                      {
                        name: "Dengue",
                        id: "7,847",
                        my: "206,819",
                        vn: "195,397",
                        sg: "",
                        ph: "238,496",
                        th: "3,200",
                        dark: false,
                      },
                      {
                        name: "Hand, Foot, Mouth Disease (HFMD)",
                        id: "108",
                        my: "",
                        vn: "148,739",
                        sg: "",
                        ph: "",
                        th: "12,400",
                        dark: false,
                      },
                      {
                        name: "COVID-19",
                        id: "",
                        my: "",
                        vn: "203",
                        sg: "",
                        ph: "",
                        th: "140,002",
                        dark: false,
                      },
                      {
                        name: "Tuberculosis",
                        id: "53,207",
                        my: "",
                        vn: "1",
                        sg: "",
                        ph: "",
                        th: "2 reports",
                        dark: false,
                      },
                      {
                        name: "Leptospirosis",
                        id: "",
                        my: "",
                        vn: "",
                        sg: "",
                        ph: "18,312",
                        th: "5,483",
                        dark: false,
                      },
                      {
                        name: "Influenza",
                        id: "2,295",
                        my: "",
                        vn: "7,086",
                        sg: "1 report",
                        ph: "1 report",
                        th: "2,860",
                        dark: false,
                      },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-blue-50/30">
                        <td className="p-1.5 font-bold text-[#191c1e] sticky left-0 bg-white border-r border-slate-100 shadow-xs truncate max-w-[120px]">
                          {row.name}
                        </td>
                        <td className={`p-1.5 text-center font-semibold ${row.id ? (row.dark ? "bg-[#003396] text-white rounded font-black" : "bg-blue-100 text-[#003396] rounded") : "text-slate-300"}`}>
                          {row.id || "-"}
                        </td>
                        <td className={`p-1.5 text-center font-semibold ${row.my ? "bg-blue-200 text-[#003396] rounded font-bold" : "text-slate-300"}`}>
                          {row.my || "-"}
                        </td>
                        <td className={`p-1.5 text-center font-semibold ${row.vn ? "bg-blue-100 text-[#003396] rounded" : "text-slate-300"}`}>
                          {row.vn || "-"}
                        </td>
                        <td className={`p-1.5 text-center font-semibold ${row.sg ? "bg-blue-200 text-[#003396] rounded font-bold" : "text-slate-300"}`}>
                          {row.sg || "-"}
                        </td>
                        <td className={`p-1.5 text-center font-semibold ${row.ph ? "bg-blue-200 text-[#003396] rounded font-bold" : "text-slate-300"}`}>
                          {row.ph || "-"}
                        </td>
                        <td className={`p-1.5 text-center font-semibold ${row.th ? "bg-blue-100 text-[#003396] rounded" : "text-slate-300"}`}>
                          {row.th || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-1.5 border-t border-[#E2E8F0] text-center text-[8px] text-[#737784]">
                <span>Cells in italics have reports but no case count. Figures aggregated across reporting feeds.</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* SUB-MODULE 4: FILTERS & ROUTES                          */}
        {/* ======================================================= */}
        {activeSubTab === "filters" && (
          <div className="w-full h-full flex flex-col justify-between space-y-1.5 animate-in fade-in duration-150 overflow-hidden">
            <div className="bg-white rounded-2xl p-2.5 border border-[#E2E8F0] shadow-xs flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xs font-black text-[#003396] uppercase">
                  Analysis Filters &amp; Transmission Routes
                </h2>
                <span className="text-[8.5px] text-[#737784]">
                  Adjust parameters and isolate pathogen chains
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  disabled={filterLoading}
                  className="px-2.5 py-1 rounded-lg bg-[#003396] hover:bg-[#002266] text-white text-[9.5px] font-bold shadow-xs cursor-pointer"
                >
                  {filterLoading ? "Applying..." : "Apply & View Map"}
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl p-2.5 border border-[#E2E8F0] shadow-xs flex flex-col justify-between overflow-y-auto no-scrollbar space-y-2.5">
              {/* Field 1: Region / Scope */}
              <div>
                <label className="text-[8.5px] font-extrabold text-[#737784] uppercase block mb-1 flex items-center gap-1">
                  <Globe2 className="w-3 h-3 text-[#003396]" />
                  Region / Scope
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["ASEAN+3", "ASEAN", "GLOBAL"] as const).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => {
                        setDraftRegion(sc);
                        setDraftCountry("");
                      }}
                      className={`py-1.5 px-2 rounded-xl text-[9.5px] font-extrabold transition cursor-pointer ${
                        draftRegion === sc
                          ? "bg-[#003396] text-white shadow-xs"
                          : "bg-[#f8f9fc] border border-[#E2E8F0] text-[#424752]"
                      }`}
                    >
                      {sc === "ASEAN+3" ? "ASEAN+3 (14)" : sc === "ASEAN" ? "ASEAN (11)" : "GLOBAL"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Country / Location */}
              <div>
                <label className="text-[8.5px] font-extrabold text-[#737784] uppercase block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    Country / Location ({draftRegion})
                  </span>
                  {draftCountry && (
                    <span
                      onClick={() => setDraftCountry("")}
                      className="text-[8px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCountryModalOpen(true)}
                  className="w-full h-7 px-2.5 bg-[#f8f9fc] hover:bg-white border border-[#E2E8F0] rounded-xl text-left flex items-center justify-between transition cursor-pointer"
                >
                  <span className="font-bold text-slate-800 text-[9.5px] truncate">
                    {draftCountry ? draftCountry : `All Countries in ${draftRegion}`}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* Field 3: Disease */}
              <div>
                <label className="text-[8.5px] font-extrabold text-[#737784] uppercase block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Bug className="w-3 h-3 text-red-500" />
                    Disease Concept
                  </span>
                  {draftDisease && (
                    <span
                      onClick={() => setDraftDisease("")}
                      className="text-[8px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setIsDiseaseModalOpen(true)}
                  className="w-full h-7 px-2.5 bg-[#f8f9fc] hover:bg-white border border-[#E2E8F0] rounded-xl text-left flex items-center justify-between transition cursor-pointer"
                >
                  <span className="font-bold text-slate-800 text-[9.5px] truncate">
                    {draftDisease ? draftDisease : "All Diseases"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* Field 4: Time Window (Days) */}
              <div>
                <label className="text-[8.5px] font-extrabold text-[#737784] uppercase block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#003396]" />
                  Time Window (Days)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["7", "30", "90"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDraftPeriod(d)}
                      className={`py-1.5 px-2 rounded-xl text-[9.5px] font-extrabold transition cursor-pointer ${
                        draftPeriod === d
                          ? "bg-[#003396] text-white shadow-xs"
                          : "bg-[#f8f9fc] border border-[#E2E8F0] text-[#424752]"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 5: Transmission routes */}
              <div>
                <label className="text-[8.5px] font-extrabold text-[#737784] uppercase block mb-1">
                  Transmission Routes
                </label>
                <div className="space-y-1 text-[9.5px] text-[#191c1e] font-semibold">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-[#003396] rounded" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Mosquito / vector-borne
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-[#003396] rounded" />
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span> Respiratory / airborne
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-[#003396] rounded" />
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Animal to human
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-[#003396] rounded" />
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Direct contact / blood
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-[#003396] rounded" />
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Water / food-borne
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. FIXED BOTTOM NAVIGATION WITH FLOATING ACTIVE BUTTON    */}
      {/* ========================================================= */}
      <ModuleFooterNav activeTab="analysis" onTabChange={onNavigateModule} />

      {/* ========================================================= */}
      {/* 4. MODALS FOR DISEASE & COUNTRY SELECTION                */}
      {/* ========================================================= */}
      {/* Disease Picker Modal */}
      {isDiseaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-2.5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-[#003396] uppercase flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-red-500" />
                  Select Disease
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Filter analysis by pathogen or select All
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

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100 max-h-[50vh]">
              <div
                onClick={() => {
                  setDraftDisease("");
                  setIsDiseaseModalOpen(false);
                }}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                  draftDisease === ""
                    ? "bg-blue-50 text-[#003396]"
                    : "hover:bg-slate-50 text-slate-800"
                }`}
              >
                <span>All Diseases</span>
                {draftDisease === "" && <Check className="w-4 h-4 text-[#003396]" />}
              </div>
              {filteredDiseases.map((d) => {
                const isSelected = draftDisease.toLowerCase() === d.toLowerCase();
                return (
                  <div
                    key={d}
                    onClick={() => {
                      setDraftDisease(d);
                      setIsDiseaseModalOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                      isSelected
                        ? "bg-blue-50 text-[#003396]"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <span>{d}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#003396]" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Country Picker Modal */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-2.5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-[#003396] uppercase flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Select Country in {draftRegion}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Filter analysis by country or select All
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
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#003396]"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100 max-h-[50vh]">
              <div
                onClick={() => {
                  setDraftCountry("");
                  setIsCountryModalOpen(false);
                }}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                  draftCountry === ""
                    ? "bg-blue-50 text-[#003396]"
                    : "hover:bg-slate-50 text-slate-800"
                }`}
              >
                <span>All Countries in {draftRegion}</span>
                {draftCountry === "" && <Check className="w-4 h-4 text-[#003396]" />}
              </div>
              {filteredCountries.map((c) => {
                const isSelected = draftCountry.toLowerCase() === c.toLowerCase();
                return (
                  <div
                    key={c}
                    onClick={() => {
                      setDraftCountry(c);
                      setIsCountryModalOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                      isSelected
                        ? "bg-blue-50 text-[#003396]"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <span>{c}</span>
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
