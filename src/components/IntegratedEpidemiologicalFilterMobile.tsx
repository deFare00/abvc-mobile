"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Filter,
  Calendar,
  ChevronDown,
  RotateCcw,
  Check,
  Search,
  X,
  Globe2,
  MapPin,
  Bug,
  CalendarDays,
  Clock,
} from "lucide-react";
import {
  getMasterRegions,
  getMasterCountries,
  getDiseaseConcepts,
  MasterRegion,
  MasterCountry,
  DiseaseConcept,
  SurveillanceFilterParams,
} from "@/lib/surveillanceApi";

interface IntegratedEpidemiologicalFilterMobileProps {
  initialRegion?: string;
  initialDiseases?: string[];
  initialCountries?: string[];
  initialStartDate?: string;
  initialEndDate?: string;
  onApply: (filters: SurveillanceFilterParams) => void;
  onReset?: () => void;
  isLoading?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;
  const [, y, m, d] = match;
  const day = Number(d);
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";
  return `${MONTH_SHORT[Number(m) - 1]} ${day}${suffix}, ${y}`;
}

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return "";
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;
  const [, , m, d] = match;
  return `${MONTH_SHORT[Number(m) - 1]} ${Number(d)}`;
}

function calculateDaysDifference(startStr: string, endStr: string): number {
  try {
    const s = new Date(startStr).getTime();
    const e = new Date(endStr).getTime();
    if (isNaN(s) || isNaN(e)) return 30;
    return Math.max(1, Math.round((e - s) / (24 * 60 * 60 * 1000)) + 1);
  } catch {
    return 30;
  }
}

function sameCountry(a: string, b: string): boolean {
  if (!a || !b) return false;
  const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_.'"]/g, "");
  return normalize(a) === normalize(b);
}

function storedCountryValue(name: string): string {
  const key = name.trim().toLowerCase();
  if (key.includes("brunei")) return "Brunei";
  if (key === "lao pdr" || key === "laos" || key === "lao") return "Laos";
  if (key === "viet nam" || key === "vietnam") return "Vietnam";
  if (key === "china" || key === "tiongkok") return "China";
  if (key === "japan" || key === "jepang") return "Japan";
  if (key === "south korea" || key === "korea" || key === "republic of korea") return "South Korea";
  return name;
}

const DEFAULT_ASEAN_COUNTRIES = [
  { id: "BRN", name: "Brunei Darussalam", iso2: "BN", iso3: "BRN" },
  { id: "KHM", name: "Cambodia", iso2: "KH", iso3: "KHM" },
  { id: "IDN", name: "Indonesia", iso2: "ID", iso3: "IDN" },
  { id: "LAO", name: "Lao PDR", iso2: "LA", iso3: "LAO" },
  { id: "MYS", name: "Malaysia", iso2: "MY", iso3: "MYS" },
  { id: "MMR", name: "Myanmar", iso2: "MM", iso3: "MMR" },
  { id: "PHL", name: "Philippines", iso2: "PH", iso3: "PHL" },
  { id: "SGP", name: "Singapore", iso2: "SG", iso3: "SGP" },
  { id: "THA", name: "Thailand", iso2: "TH", iso3: "THA" },
  { id: "TLS", name: "Timor-Leste", iso2: "TL", iso3: "TLS" },
  { id: "VNM", name: "Viet Nam", iso2: "VN", iso3: "VNM" },
];

const EAST_ASIA_3_PARTNERS = [
  { id: "CHN", name: "China", iso2: "CN", iso3: "CHN" },
  { id: "JPN", name: "Japan", iso2: "JP", iso3: "JPN" },
  { id: "KOR", name: "South Korea", iso2: "KR", iso3: "KOR" },
];

const DEFAULT_DISEASE_LIST = [
  "Acute Respiratory Infection (ARI/ISPA)",
  "Avian Influenza (H5N1)",
  "Cholera",
  "COVID-19",
  "Dengue",
  "Diphtheria",
  "Hand, Foot, and Mouth Disease (HFMD)",
  "Influenza",
  "Japanese Encephalitis",
  "Leptospirosis",
  "Malaria",
  "Measles",
  "Mpox",
  "Nipah Virus Infection",
  "Rabies",
  "Tuberculosis (TB)",
  "Typhoid",
  "Zika",
];

export default function IntegratedEpidemiologicalFilterMobile({
  initialRegion = "ASEAN",
  initialDiseases = [],
  initialCountries = [],
  initialStartDate = "2026-09-29",
  initialEndDate = "2026-10-29",
  onApply,
  onReset,
  isLoading = false,
}: IntegratedEpidemiologicalFilterMobileProps) {
  // Master Data
  const [regions, setRegions] = useState<MasterRegion[]>([]);
  const [countries, setCountries] = useState<MasterCountry[]>([]);
  const [diseases, setDiseases] = useState<DiseaseConcept[]>([]);

  // Draft Filter States
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(initialDiseases);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(initialCountries);
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);

  // Modals for Mobile Multi-select
  const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // Search queries inside modals
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  // Local draft dates for date modal
  const [draftStartDate, setDraftStartDate] = useState<string>(initialStartDate);
  const [draftEndDate, setDraftEndDate] = useState<string>(initialEndDate);

  // Load master data on mount
  useEffect(() => {
    let alive = true;
    Promise.all([
      getMasterRegions(),
      getMasterCountries(),
      getDiseaseConcepts(),
    ]).then(([regs, cts, dis]) => {
      if (!alive) return;
      if (regs && regs.length > 0) setRegions(regs);
      if (cts && cts.length > 0) setCountries(cts);
      if (dis && dis.length > 0) setDiseases(dis);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Compute Country choices strictly based on selected Region
  const countryChoices = useMemo(() => {
    const regionObj = regions.find(
      (r) =>
        r.code.toLowerCase() === selectedRegion.toLowerCase() ||
        r.name.toLowerCase() === selectedRegion.toLowerCase() ||
        (selectedRegion === "ASEAN+3" && r.code === "ASEAN_PLUS_THREE")
    );

    if (regionObj && regionObj.countries && regionObj.countries.length > 0) {
      return regionObj.countries;
    }

    if (selectedRegion === "ASEAN") {
      return DEFAULT_ASEAN_COUNTRIES;
    } else if (selectedRegion === "ASEAN+3") {
      return [...DEFAULT_ASEAN_COUNTRIES, ...EAST_ASIA_3_PARTNERS];
    } else if (selectedRegion === "GLOBAL" && countries.length > 0) {
      return countries;
    }

    return DEFAULT_ASEAN_COUNTRIES;
  }, [regions, countries, selectedRegion]);

  // Selected Region Label
  const selectedRegionLabel = useMemo(() => {
    const r = regions.find((x) => x.code === selectedRegion || x.name === selectedRegion);
    if (r) {
      return r.code === "GLOBAL" ? "Global" : `${r.name} (${r.member_count} States)`;
    }
    return selectedRegion === "ASEAN"
      ? "ASEAN (11 States)"
      : selectedRegion === "ASEAN+3"
      ? "ASEAN+3 (14 States)"
      : "Global (All Regions)";
  }, [regions, selectedRegion]);

  // When Region changes, reset countries in draft
  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    setSelectedCountries([]);
  };

  // Multi-select toggle helpers
  const toggleDisease = (diseaseName: string) => {
    setSelectedDiseases((prev) =>
      prev.some((d) => d.toLowerCase() === diseaseName.toLowerCase())
        ? prev.filter((d) => d.toLowerCase() !== diseaseName.toLowerCase())
        : [...prev, diseaseName]
    );
  };

  const diseaseList: DiseaseConcept[] = useMemo(() => {
    if (diseases && diseases.length > 0) return diseases;
    return DEFAULT_DISEASE_LIST.map((name) => ({
      id: name,
      disease_id: name,
      canonical_name: name,
      category: "Communicable",
      is_zoonotic: false,
      is_active: true,
    }));
  }, [diseases]);

  const selectAllDiseases = () => {
    setSelectedDiseases(diseaseList.map((d) => d.canonical_name));
  };

  const clearAllDiseases = () => {
    setSelectedDiseases([]);
  };

  const toggleCountry = (countryName: string) => {
    const val = storedCountryValue(countryName);
    setSelectedCountries((prev) =>
      prev.some((c) => sameCountry(c, val))
        ? prev.filter((c) => !sameCountry(c, val))
        : [...prev, val]
    );
  };

  const selectAllCountries = () => {
    setSelectedCountries(countryChoices.map((c) => storedCountryValue(c.name)));
  };

  const clearAllCountries = () => {
    setSelectedCountries([]);
  };

  // Filtered lists for modals
  const filteredDiseases = useMemo(() => {
    if (!diseaseSearch.trim()) return diseaseList;
    const q = diseaseSearch.toLowerCase().trim();
    return diseaseList.filter(
      (d) =>
        d.canonical_name.toLowerCase().includes(q) ||
        (d.category && d.category.toLowerCase().includes(q))
    );
  }, [diseaseList, diseaseSearch]);

  const filteredCountryChoices = useMemo(() => {
    if (!countrySearch.trim()) return countryChoices;
    const q = countrySearch.toLowerCase().trim();
    return countryChoices.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso3.toLowerCase().includes(q)
    );
  }, [countryChoices, countrySearch]);

  // Date Presets Handler
  const handleSelectPreset = (days: number) => {
    const end = new Date("2026-10-29");
    const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    const endIso = end.toISOString().split("T")[0];
    const startIso = start.toISOString().split("T")[0];
    setDraftStartDate(startIso);
    setDraftEndDate(endIso);
  };

  const handleSelectYtd = () => {
    setDraftStartDate("2026-01-01");
    setDraftEndDate("2026-10-29");
  };

  // Handle Apply
  const handleApplyClick = () => {
    onApply({
      region: selectedRegion,
      diseases: selectedDiseases,
      countries: selectedCountries,
      startDate,
      endDate,
    });
  };

  // Handle Reset
  const handleResetClick = () => {
    setSelectedRegion("ASEAN");
    setSelectedDiseases([]);
    setSelectedCountries([]);
    setStartDate("2026-09-29");
    setEndDate("2026-10-29");
    setDraftStartDate("2026-09-29");
    setDraftEndDate("2026-10-29");

    if (onReset) onReset();
    else {
      onApply({
        region: "ASEAN",
        diseases: [],
        countries: [],
        startDate: "2026-09-29",
        endDate: "2026-10-29",
      });
    }
  };

  const totalDays = calculateDaysDifference(startDate, endDate);
  const draftTotalDays = calculateDaysDifference(draftStartDate, draftEndDate);

  return (
    <>
      {/* ========================================================= */}
      {/* 1. FILTER CONTAINER BOX (NLP PROTOTYPE MATCH)              */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E2E8F0] shadow-xs space-y-2 flex-shrink-0 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-[#003396]">
            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-[#003396]">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block leading-tight">
                Integrated Epidemiological Surveillance Filter
              </span>
              <span className="text-[8.5px] text-[#737784] font-medium block">
                Multi-select disease, region scope, location, and date range picker
              </span>
            </div>
          </div>
          <span className="text-[8.5px] font-extrabold text-[#003396] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
            {formatShortDate(startDate)} — {formatDisplayDate(endDate)}
          </span>
        </div>

        {/* 4 Interactive Fields (2x2 Grid on Mobile) */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {/* FIELD 1: DISEASE (MULTI-SELECT) */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Bug className="w-3 h-3 text-red-500" />
                Disease (Multi-Select)
              </span>
              {selectedDiseases.length > 0 && (
                <span className="text-[8px] font-bold text-blue-700 bg-blue-50 px-1 rounded">
                  {selectedDiseases.length} selected
                </span>
              )}
            </label>

            <button
              type="button"
              onClick={() => setIsDiseaseModalOpen(true)}
              className="w-full h-8.5 px-2.5 bg-[#f8f9fc] hover:bg-white focus:bg-white border border-[#E2E8F0] focus:border-[#003396] rounded-xl text-left flex items-center justify-between transition shadow-2xs cursor-pointer"
            >
              <div className="min-w-0 pr-1">
                <span className="block font-bold text-slate-800 text-[10px] truncate leading-tight">
                  {selectedDiseases.length === 0
                    ? "All Diseases"
                    : selectedDiseases.length === 1
                    ? selectedDiseases[0]
                    : `${selectedDiseases.length} Diseases Selected`}
                </span>
                <span className="block text-[8px] text-[#737784] truncate">
                  {selectedDiseases.length === 0
                    ? "All classifications"
                    : selectedDiseases.slice(0, 2).join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {selectedDiseases.length > 0 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllDiseases();
                    }}
                    title="Clear"
                    className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </button>
          </div>

          {/* FIELD 2: REGION / SCOPE */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-[#003396]" />
              Region / Scope
            </label>

            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full h-8.5 px-2.5 bg-[#f8f9fc] hover:bg-white focus:bg-white border border-[#E2E8F0] focus:border-[#003396] rounded-xl font-bold text-slate-800 text-[10px] appearance-none pr-7 shadow-2xs cursor-pointer outline-none transition"
              >
                <option value="ASEAN">ASEAN (11 States)</option>
                <option value="ASEAN+3">ASEAN+3 (14 States)</option>
                <option value="GLOBAL">Global (All Regions)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
            <span className="text-[8px] text-[#737784] px-1 truncate">
              {selectedRegion === "GLOBAL"
                ? "Global surveillance"
                : `${selectedRegionLabel} regional scope`}
            </span>
          </div>

          {/* FIELD 3: LOCATION (MULTI-SELECT) */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Location (Multi-Select)
              </span>
              {selectedCountries.length > 0 && (
                <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                  {selectedCountries.length} selected
                </span>
              )}
            </label>

            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="w-full h-8.5 px-2.5 bg-[#f8f9fc] hover:bg-white focus:bg-white border border-[#E2E8F0] focus:border-[#003396] rounded-xl text-left flex items-center justify-between transition shadow-2xs cursor-pointer"
            >
              <div className="min-w-0 pr-1">
                <span className="block font-bold text-slate-800 text-[10px] truncate leading-tight">
                  {selectedCountries.length === 0
                    ? `All Countries (${selectedRegion})`
                    : selectedCountries.length === 1
                    ? selectedCountries[0]
                    : `${selectedCountries.length} Countries Selected`}
                </span>
                <span className="block text-[8px] text-[#737784] truncate">
                  {selectedCountries.length === 0
                    ? `All countries in ${selectedRegion}`
                    : selectedCountries.slice(0, 2).join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {selectedCountries.length > 0 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllCountries();
                    }}
                    title="Clear"
                    className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </button>
          </div>

          {/* FIELD 4: DATE RANGE (INTERACTIVE PICKER) */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#003396]" />
                Date Range
              </span>
              <span className="text-[8px] font-bold text-[#003396] bg-blue-50 px-1 rounded">
                {totalDays} days
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                setDraftStartDate(startDate);
                setDraftEndDate(endDate);
                setIsDateModalOpen(true);
              }}
              className="w-full h-8.5 px-2.5 bg-[#f8f9fc] hover:bg-white focus:bg-white border border-[#E2E8F0] focus:border-[#003396] rounded-xl text-left flex items-center justify-between transition shadow-2xs cursor-pointer"
            >
              <div className="min-w-0 pr-1">
                <span className="block font-bold text-slate-800 text-[9.5px] truncate leading-tight">
                  {formatShortDate(startDate)} — {formatDisplayDate(endDate)}
                </span>
                <span className="block text-[8px] text-[#737784] truncate">
                  {totalDays} days span • Tap to change
                </span>
              </div>
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Action Buttons: APPLY and RESET */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={handleApplyClick}
            disabled={isLoading}
            className="flex-1 h-8 rounded-xl bg-[#003396] hover:bg-[#002266] active:scale-[0.99] text-white font-black text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isLoading ? "APPLYING..." : "APPLY"}</span>
          </button>
          <button
            type="button"
            onClick={handleResetClick}
            className="w-8 h-8 rounded-xl bg-[#f8f9fc] hover:bg-[#eceef0] active:scale-95 border border-[#E2E8F0] text-[#737784] flex items-center justify-center transition shadow-2xs cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DISEASE MULTI-SELECT MODAL (STRICT MOBILE MAX-W-[430px]) */}
      {/* ========================================================= */}
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
                  {selectedDiseases.length === 0
                    ? "All diseases active"
                    : `${selectedDiseases.length} of ${diseaseList.length} selected`}
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

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search disease or pathogen..."
                value={diseaseSearch}
                onChange={(e) => setDiseaseSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#003396]"
              />
            </div>

            {/* Actions: Select All / Clear */}
            <div className="flex items-center justify-between text-[11px] font-bold px-1">
              <button
                type="button"
                onClick={selectAllDiseases}
                className="text-[#003396] hover:underline cursor-pointer"
              >
                Select All ({diseaseList.length})
              </button>
              <button
                type="button"
                onClick={clearAllDiseases}
                className="text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 py-1 max-h-[50vh]">
              {filteredDiseases.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No diseases found matching &quot;{diseaseSearch}&quot;
                </div>
              ) : (
                filteredDiseases.map((d) => {
                  const isChecked = selectedDiseases.some(
                    (item) => item.toLowerCase() === d.canonical_name.toLowerCase()
                  );
                  return (
                    <label
                      key={d.id || d.canonical_name}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                        isChecked
                          ? "bg-blue-50 text-[#003396] border-blue-200 font-bold"
                          : "bg-slate-50/60 hover:bg-slate-100/70 border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDisease(d.canonical_name)}
                          className="w-4 h-4 accent-[#003396] rounded shrink-0 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <span className="block truncate">{d.canonical_name}</span>
                          {d.category && (
                            <span className="block text-[9px] text-slate-400 font-normal truncate">
                              {d.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {d.is_zoonotic && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-800 shrink-0">
                          Zoonotic
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsDiseaseModalOpen(false)}
              className="w-full h-9 rounded-xl bg-[#003396] text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99] transition-transform cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                Done ({selectedDiseases.length === 0 ? "All Diseases" : `${selectedDiseases.length} Selected`})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. LOCATION MULTI-SELECT MODAL (STRICT MOBILE MAX-W-[430px]) */}
      {/* ========================================================= */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-2.5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-[#003396] uppercase flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Select Location(s) — {selectedRegion}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {selectedCountries.length === 0
                    ? `All countries in ${selectedRegion} active`
                    : `${selectedCountries.length} of ${countryChoices.length} selected`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search country in region..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#003396]"
              />
            </div>

            {/* Actions: Select All / Clear */}
            <div className="flex items-center justify-between text-[11px] font-bold px-1">
              <button
                type="button"
                onClick={selectAllCountries}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                Select All ({countryChoices.length})
              </button>
              <button
                type="button"
                onClick={clearAllCountries}
                className="text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 py-1 max-h-[50vh]">
              {filteredCountryChoices.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No countries found matching &quot;{countrySearch}&quot;
                </div>
              ) : (
                filteredCountryChoices.map((c) => {
                  const val = storedCountryValue(c.name);
                  const isChecked = selectedCountries.some((item) => sameCountry(item, val));
                  return (
                    <label
                      key={c.iso3 || c.name}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                        isChecked
                          ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold"
                          : "bg-slate-50/60 hover:bg-slate-100/70 border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCountry(c.name)}
                          className="w-4 h-4 accent-emerald-600 rounded shrink-0 cursor-pointer"
                        />
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                        {c.iso3}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full h-9 rounded-xl bg-emerald-700 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99] transition-transform cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                Done ({selectedCountries.length === 0 ? "All Countries" : `${selectedCountries.length} Selected`})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DATE RANGE PICKER MODAL (STRICT MOBILE MAX-W-[430px])   */}
      {/* ========================================================= */}
      {isDateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-[#003396] uppercase flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#003396]" />
                  Select Date Range
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Filter surveillance signals by timeframe
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#003396]" />
                Quick Presets
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleSelectPreset(7)}
                  className={`py-1.5 px-2 rounded-xl border font-bold transition cursor-pointer text-center ${
                    draftTotalDays === 7
                      ? "bg-blue-50 border-blue-300 text-[#003396]"
                      : "bg-slate-50 hover:bg-blue-50/50 border-slate-200 text-slate-700"
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(14)}
                  className={`py-1.5 px-2 rounded-xl border font-bold transition cursor-pointer text-center ${
                    draftTotalDays === 14
                      ? "bg-blue-50 border-blue-300 text-[#003396]"
                      : "bg-slate-50 hover:bg-blue-50/50 border-slate-200 text-slate-700"
                  }`}
                >
                  Last 14 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(30)}
                  className={`py-1.5 px-2 rounded-xl border font-bold transition cursor-pointer text-center ${
                    draftTotalDays === 30
                      ? "bg-blue-50 border-blue-300 text-[#003396]"
                      : "bg-slate-50 hover:bg-blue-50/50 border-slate-200 text-slate-700"
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(90)}
                  className={`py-1.5 px-2 rounded-xl border font-bold transition cursor-pointer text-center ${
                    draftTotalDays === 90
                      ? "bg-blue-50 border-blue-300 text-[#003396]"
                      : "bg-slate-50 hover:bg-blue-50/50 border-slate-200 text-slate-700"
                  }`}
                >
                  Last 90 Days
                </button>
                <button
                  type="button"
                  onClick={handleSelectYtd}
                  className={`py-1.5 px-2 rounded-xl border font-bold transition cursor-pointer text-center col-span-2 ${
                    draftStartDate === "2026-01-01"
                      ? "bg-blue-50 border-blue-300 text-[#003396]"
                      : "bg-slate-50 hover:bg-blue-50/50 border-slate-200 text-slate-700"
                  }`}
                >
                  Year to Date (2026)
                </button>
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-[#003396]" />
                Custom Date Range
              </label>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="block text-[8.5px] font-bold text-slate-600 uppercase mb-1">
                    Start Date
                  </span>
                  <input
                    type="date"
                    value={draftStartDate}
                    onChange={(e) => setDraftStartDate(e.target.value)}
                    className="w-full h-8.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-800 outline-none focus:border-[#003396] focus:bg-white"
                  />
                </div>
                <div>
                  <span className="block text-[8.5px] font-bold text-slate-600 uppercase mb-1">
                    End Date
                  </span>
                  <input
                    type="date"
                    value={draftEndDate}
                    onChange={(e) => setDraftEndDate(e.target.value)}
                    className="w-full h-8.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-800 outline-none focus:border-[#003396] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Preview Range */}
            <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-[9.5px]">
              <span className="font-bold text-[#003396] truncate pr-2">
                {formatDisplayDate(draftStartDate)} — {formatDisplayDate(draftEndDate)}
              </span>
              <span className="font-extrabold text-[#003396] bg-blue-100 px-1.5 py-0.5 rounded shrink-0">
                {draftTotalDays} days
              </span>
            </div>

            {draftStartDate > draftEndDate && (
              <p className="text-[9px] font-bold text-rose-600 text-center">
                Start date cannot be after end date.
              </p>
            )}

            {/* Apply Button */}
            <button
              type="button"
              disabled={draftStartDate > draftEndDate}
              onClick={() => {
                setStartDate(draftStartDate);
                setEndDate(draftEndDate);
                setIsDateModalOpen(false);
              }}
              className="w-full h-9 rounded-xl bg-[#003396] disabled:opacity-50 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99] transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply Date Range</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
