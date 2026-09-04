"use client";

import React, { useState, useEffect } from "react";
import {
  Filter,
  Globe,
  Calendar,
  Bug,
  Skull,
  Activity,
  MapPin,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  LayoutGrid,
  Columns3,
  Loader2,
  Check,
} from "lucide-react";
import { DashboardSummaryCards } from "@/types/dashboardApi";

interface SurveillanceMetricsProps {
  summaryCards?: DashboardSummaryCards | null;
  availableYears?: number[];
  isLoading?: boolean;
  selectedCountry?: string;
  selectedYear?: string;
  onFilterApply?: (country: string, year: string) => void;
}

export default function SurveillanceMetrics({
  summaryCards,
  availableYears,
  isLoading = false,
  selectedCountry: initialCountry = "All ASEAN Countries",
  selectedYear: initialYear = "2026",
  onFilterApply,
}: SurveillanceMetricsProps) {
  // Filter States
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [appliedFilter, setAppliedFilter] = useState({
    country: initialCountry,
    year: initialYear,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid");

  // Custom Dropdown UI States & Refs
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const countryDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const yearDropdownRef = React.useRef<HTMLDivElement | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Synchronize when external props change
  useEffect(() => {
    if (initialCountry) {
      setSelectedCountry(initialCountry);
      setAppliedFilter((prev) => ({ ...prev, country: initialCountry }));
    }
  }, [initialCountry]);

  useEffect(() => {
    if (initialYear) {
      setSelectedYear(initialYear);
      setAppliedFilter((prev) => ({ ...prev, year: initialYear }));
    }
  }, [initialYear]);

  const countries = [
    "All ASEAN Countries",
    "Brunei Darussalam",
    "Cambodia",
    "Indonesia",
    "Laos",
    "Malaysia",
    "Myanmar",
    "Philippines",
    "Singapore",
    "Thailand",
    "Timor-Leste",
    "Vietnam",
  ];

  const years =
    availableYears && availableYears.length > 0
      ? availableYears.map((y) => String(y))
      : ["2026", "2025", "2024", "2023", "2022"];

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCountryDropdownOpen(false);
    setIsYearDropdownOpen(false);
    setIsApplying(true);
    setAppliedFilter({
      country: selectedCountry,
      year: selectedYear,
    });

    if (onFilterApply) {
      onFilterApply(selectedCountry, selectedYear);
    }

    setTimeout(() => {
      setIsApplying(false);
    }, 350);
  };

  // Card Data dynamically populated from Rust Backend API summary_cards
  const metrics = [
    {
      id: "detected-cases",
      name: "DETECTED CASES",
      value: summaryCards
        ? summaryCards.detected_cases.current.toLocaleString()
        : "545,488",
      month: summaryCards
        ? `PREV: ${summaryCards.detected_cases.previous.toLocaleString()}`
        : "PREV: 1,222,441",
      trend: summaryCards
        ? `${summaryCards.detected_cases.percentage_change >= 0 ? "+" : ""}${summaryCards.detected_cases.percentage_change}% from prev`
        : "-55.4% from prev",
      isPositive: summaryCards
        ? summaryCards.detected_cases.percentage_change >= 0
        : false,
      icon: Bug,
      iconBg: "bg-[#003396]/10 text-[#003396] border border-[#003396]/20",
      valueColor: "text-[#003396]",
      badgeText: "DETECTED CASES",
    },
    {
      id: "deaths",
      name: "DEATHS",
      value: summaryCards
        ? summaryCards.deaths.current.toLocaleString()
        : "3,416",
      month: summaryCards
        ? `PREV: ${summaryCards.deaths.previous.toLocaleString()}`
        : "PREV: 11,787",
      trend: summaryCards
        ? `${summaryCards.deaths.percentage_change >= 0 ? "+" : ""}${summaryCards.deaths.percentage_change}% from prev`
        : "-71.0% from prev",
      isPositive: summaryCards
        ? summaryCards.deaths.percentage_change >= 0
        : false,
      icon: Skull,
      iconBg: "bg-[#BA1A1A]/10 text-[#BA1A1A] border border-[#BA1A1A]/20",
      valueColor: "text-[#BA1A1A]",
      badgeText: "FATALITY",
    },
    {
      id: "validated-events",
      name: "VALIDATED EVENTS",
      value: summaryCards
        ? summaryCards.validated_events.current.toLocaleString()
        : "338",
      month: summaryCards
        ? `PREV: ${summaryCards.validated_events.previous.toLocaleString()}`
        : "PREV: 717",
      trend: summaryCards
        ? `${summaryCards.validated_events.percentage_change >= 0 ? "+" : ""}${summaryCards.validated_events.percentage_change}% from prev`
        : "-52.9% from prev",
      isPositive: summaryCards
        ? summaryCards.validated_events.percentage_change >= 0
        : false,
      icon: Activity,
      iconBg: "bg-[#0052B4]/10 text-[#0052B4] border border-[#0052B4]/20",
      valueColor: "text-[#003396]",
      badgeText: "VALIDATED EVENTS",
    },
    {
      id: "locations",
      name: "LOCATIONS",
      value: summaryCards
        ? summaryCards.locations.current.toLocaleString()
        : "62",
      month: summaryCards
        ? `PREV: ${summaryCards.locations.previous.toLocaleString()}`
        : "PREV: 116",
      trend: summaryCards
        ? `${summaryCards.locations.percentage_change >= 0 ? "+" : ""}${summaryCards.locations.percentage_change}% from prev`
        : "-46.6% from prev",
      isPositive: summaryCards
        ? summaryCards.locations.percentage_change >= 0
        : false,
      icon: MapPin,
      iconBg: "bg-[#003396]/10 text-[#003396] border border-[#003396]/20",
      valueColor: "text-[#003396]",
      badgeText: "LOCATIONS",
    },
    {
      id: "active-alerts",
      name: "ACTIVE ALERTS",
      value: summaryCards
        ? summaryCards.active_alerts.current.toLocaleString()
        : "0",
      month: summaryCards
        ? `PREV: ${summaryCards.active_alerts.previous.toLocaleString()}`
        : "PREV: 8",
      trend: summaryCards
        ? `${summaryCards.active_alerts.percentage_change >= 0 ? "+" : ""}${summaryCards.active_alerts.percentage_change}% from prev`
        : "-100% from prev",
      isPositive: summaryCards
        ? summaryCards.active_alerts.percentage_change >= 0
        : false,
      icon: AlertTriangle,
      iconBg: "bg-[#FED889]/35 text-[#785D1A] border border-[#C1A74F]/40",
      valueColor: "text-[#B45309]",
      badgeText: "ACTIVE ALERTS",
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* ========================================================= */}
      {/* 1. SURVEILLANCE FILTER (REDESIGNED FOR MOBILE)            */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm transition-all hover:shadow-md">
        {/* Header: Title & Subtitle + Collapse/Status */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0]/70">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#003396]/10 border border-[#003396]/20 flex items-center justify-center text-[#003396] flex-shrink-0 mt-0.5">
              <Filter className="w-4 h-4 text-[#003396]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-[#003396] tracking-tight uppercase">
                  SURVEILLANCE FILTER
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#003396]/5 text-[#003396] border border-[#003396]/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE API
                </span>
                {isLoading && (
                  <Loader2 className="w-3 h-3 animate-spin text-[#003396]" />
                )}
              </div>
              <p className="text-[10.5px] font-medium text-[#737784] mt-0.5 leading-snug">
                Connected to Rust Backend summary API
              </p>
            </div>
          </div>

          {/* Active Filter Pill */}
          <button
            type="button"
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              setIsCountryDropdownOpen(false);
              setIsYearDropdownOpen(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f8f9fc] hover:bg-[#e2e8f0]/60 border border-[#E2E8F0] text-[10px] font-bold text-[#424752] transition-colors flex-shrink-0 cursor-pointer"
            title={isFilterOpen ? "Hide filter" : "Open filter"}
          >
            <span className="max-w-[110px] truncate text-[#003396]">
              {appliedFilter.country === "All ASEAN Countries" || appliedFilter.country === "All"
                ? "ASEAN"
                : appliedFilter.country}{" "}
              • {appliedFilter.year}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-[#737784] transition-transform duration-200 ${
                isFilterOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Collapsible Filter Form Controls */}
        {isFilterOpen && (
          <div className="pt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Country & Year Controls in Mobile Stack/Grid */}
            <div className="space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2.5 relative z-30">
              {/* Custom Country Selector */}
              <div ref={countryDropdownRef} className="relative sm:col-span-7">
                <button
                  type="button"
                  onClick={() => {
                    setIsCountryDropdownOpen((prev) => !prev);
                    setIsYearDropdownOpen(false);
                  }}
                  className={`w-full text-left bg-[#f8f9fc] hover:bg-white rounded-2xl p-2.5 border transition-all cursor-pointer focus:outline-none ${
                    isCountryDropdownOpen
                      ? "border-[#003396] shadow-md ring-2 ring-[#003396]/15 bg-white"
                      : "border-[#E2E8F0] hover:border-[#003396]/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#003396]" />
                      <span className="text-[9.5px] font-black text-[#737784] uppercase tracking-wider">
                        COUNTRY
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-[#003396] bg-[#003396]/8 px-1.5 py-0.2 rounded-md">
                      {countries.length} regions
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#191c1e] truncate">
                      {selectedCountry}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#737784] transition-transform duration-200 flex-shrink-0 ${
                        isCountryDropdownOpen ? "rotate-180 text-[#003396]" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Country Custom Popover Menu */}
                {isCountryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="max-h-56 overflow-y-auto space-y-0.5 overscroll-contain pr-1 custom-scrollbar">
                      {countries.map((c) => {
                        const isSelected = selectedCountry === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsCountryDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#003396] text-white font-bold shadow-xs"
                                : "text-[#334155] hover:bg-[#f1f5f9] hover:text-[#003396] font-semibold"
                            }`}
                          >
                            <span className="truncate">{c}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white stroke-[2.5] flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Year Selector */}
              <div ref={yearDropdownRef} className="relative sm:col-span-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsYearDropdownOpen((prev) => !prev);
                    setIsCountryDropdownOpen(false);
                  }}
                  className={`w-full text-left bg-[#f8f9fc] hover:bg-white rounded-2xl p-2.5 border transition-all cursor-pointer focus:outline-none ${
                    isYearDropdownOpen
                      ? "border-[#003396] shadow-md ring-2 ring-[#003396]/15 bg-white"
                      : "border-[#E2E8F0] hover:border-[#003396]/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#003396]" />
                      <span className="text-[9.5px] font-black text-[#737784] uppercase tracking-wider">
                        YEAR
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-[#003396] bg-[#003396]/8 px-1.5 py-0.2 rounded-md">
                      Annual
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#191c1e] truncate">
                      {selectedYear}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#737784] transition-transform duration-200 flex-shrink-0 ${
                        isYearDropdownOpen ? "rotate-180 text-[#003396]" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Year Custom Popover Menu */}
                {isYearDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="max-h-56 overflow-y-auto space-y-0.5 overscroll-contain pr-1 custom-scrollbar">
                      {years.map((y) => {
                        const isSelected = String(selectedYear) === String(y);
                        return (
                          <button
                            key={y}
                            type="button"
                            onClick={() => {
                              setSelectedYear(String(y));
                              setIsYearDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#003396] text-white font-bold shadow-xs"
                                : "text-[#334155] hover:bg-[#f1f5f9] hover:text-[#003396] font-semibold"
                            }`}
                          >
                            <span>{y}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-white stroke-[2.5] flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DASHBOARD FILTER APPLY Button */}
            <button
              type="button"
              onClick={() => handleApply()}
              disabled={isApplying || isLoading}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-[#003396] bg-[#003396]/5 hover:bg-[#003396] text-[#003396] hover:text-white font-black text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isApplying || isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>FETCHING LIVE METRICS...</span>
                </>
              ) : (
                <>
                  <Filter className="w-3.5 h-3.5" />
                  <span>DASHBOARD FILTER APPLY</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. STAT CARDS HEADER & VIEW TOGGLE (GRID vs HORIZONTAL)   */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#003396]"></span>
          <h4 className="text-xs font-black text-[#003396] tracking-tight uppercase">
            SURVEILLANCE INDICATORS SUMMARY
          </h4>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#f0f2f5] border border-[#E2E8F0] text-[10px]">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1 rounded-md flex items-center gap-1 font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-white text-[#003396] shadow-xs"
                : "text-[#737784] hover:text-[#191c1e]"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("carousel")}
            className={`p-1 rounded-md flex items-center gap-1 font-bold transition-all cursor-pointer ${
              viewMode === "carousel"
                ? "bg-white text-[#003396] shadow-xs"
                : "text-[#737784] hover:text-[#191c1e]"
            }`}
            title="Carousel View"
          >
            <Columns3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. THE 5 STAT CARDS (POWERED BY LIVE API DATA)            */}
      {/* ========================================================= */}
      {viewMode === "grid" ? (
        /* GRID MODE: 2x2 Grid + 1 Full Width Banner */
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: DETECTED CASES */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm flex flex-col justify-between hover:border-[#003396]/40 transition-all">
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#003396]/10 border border-[#003396]/20 flex items-center justify-center text-[#003396] flex-shrink-0">
                <Bug className="w-5 h-5 text-[#003396]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black text-[#424752] uppercase tracking-wider block truncate">
                  DETECTED CASES
                </span>
                <span className="text-2xl font-black text-[#003396] tracking-tight block mt-0.5">
                  {metrics[0].value}
                </span>
              </div>
            </div>

            {/* Subtext & Trend */}
            <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]/60 flex flex-col gap-0.5">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase">
                {metrics[0].month}
              </span>
              <span
                className={`text-[9px] font-semibold flex items-center gap-0.5 ${
                  metrics[0].isPositive ? "text-emerald-600" : "text-[#BA1A1A]"
                }`}
              >
                {metrics[0].isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{metrics[0].trend}</span>
              </span>
            </div>
          </div>

          {/* Card 2: DEATHS */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm flex flex-col justify-between hover:border-[#BA1A1A]/40 transition-all">
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#BA1A1A]/10 border border-[#BA1A1A]/20 flex items-center justify-center text-[#BA1A1A] flex-shrink-0">
                <Skull className="w-5 h-5 text-[#BA1A1A]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black text-[#424752] uppercase tracking-wider block truncate">
                  DEATHS
                </span>
                <span className="text-2xl font-black text-[#BA1A1A] tracking-tight block mt-0.5">
                  {metrics[1].value}
                </span>
              </div>
            </div>

            {/* Subtext & Trend */}
            <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]/60 flex flex-col gap-0.5">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase">
                {metrics[1].month}
              </span>
              <span
                className={`text-[9px] font-semibold flex items-center gap-0.5 ${
                  metrics[1].isPositive ? "text-[#BA1A1A]" : "text-emerald-600"
                }`}
              >
                {metrics[1].isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{metrics[1].trend}</span>
              </span>
            </div>
          </div>

          {/* Card 3: VALIDATED EVENTS */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm flex flex-col justify-between hover:border-[#0052B4]/40 transition-all">
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#0052B4]/10 border border-[#0052B4]/20 flex items-center justify-center text-[#0052B4] flex-shrink-0">
                <Activity className="w-5 h-5 text-[#0052B4]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black text-[#424752] uppercase tracking-wider block truncate">
                  VALIDATED EVENTS
                </span>
                <span className="text-2xl font-black text-[#003396] tracking-tight block mt-0.5">
                  {metrics[2].value}
                </span>
              </div>
            </div>

            {/* Subtext & Trend */}
            <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]/60 flex flex-col gap-0.5">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase">
                {metrics[2].month}
              </span>
              <span
                className={`text-[9px] font-semibold flex items-center gap-0.5 ${
                  metrics[2].isPositive ? "text-emerald-600" : "text-[#BA1A1A]"
                }`}
              >
                {metrics[2].isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{metrics[2].trend}</span>
              </span>
            </div>
          </div>

          {/* Card 4: LOCATIONS */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm flex flex-col justify-between hover:border-[#003396]/40 transition-all">
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#003396]/10 border border-[#003396]/20 flex items-center justify-center text-[#003396] flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#003396]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black text-[#424752] uppercase tracking-wider block truncate">
                  LOCATIONS
                </span>
                <span className="text-2xl font-black text-[#003396] tracking-tight block mt-0.5">
                  {metrics[3].value}
                </span>
              </div>
            </div>

            {/* Subtext & Trend */}
            <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]/60 flex flex-col gap-0.5">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase">
                {metrics[3].month}
              </span>
              <span
                className={`text-[9px] font-semibold flex items-center gap-0.5 ${
                  metrics[3].isPositive ? "text-emerald-600" : "text-[#BA1A1A]"
                }`}
              >
                {metrics[3].isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{metrics[3].trend}</span>
              </span>
            </div>
          </div>

          {/* Card 5: ACTIVE ALERTS (Full Width Card 2 Columns) */}
          <div className="col-span-2 bg-gradient-to-r from-white via-amber-50/30 to-white rounded-2xl p-3.5 border border-[#C1A74F]/40 shadow-sm flex items-center justify-between hover:border-[#C1A74F] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FED889]/35 border border-[#C1A74F]/40 flex items-center justify-center text-[#785D1A] flex-shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-[#B45309]" />
              </div>
              <div>
                <span className="text-[10.5px] font-black text-[#424752] uppercase tracking-wider block">
                  ACTIVE ALERTS
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9.5px] font-bold text-[#737784] uppercase">
                    {metrics[4].month}
                  </span>
                  <span
                    className={`text-[9px] font-semibold flex items-center gap-0.5 ${
                      metrics[4].isPositive ? "text-[#BA1A1A]" : "text-emerald-600"
                    }`}
                  >
                    {metrics[4].isPositive ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5" />
                    )}
                    <span>{metrics[4].trend}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black text-[#B45309] tracking-tight block">
                {metrics[4].value}
              </span>
              <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#FED889]/40 text-[#785D1A] border border-[#C1A74F]/30 uppercase">
                WATCH
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* CAROUSEL MODE: Horizontal swipeable cards */
        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory no-scrollbar">
          {metrics.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="w-[210px] flex-shrink-0 snap-start bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex flex-col justify-between hover:border-[#003396]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-[#737784] uppercase">
                    {item.badgeText}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-black text-[#424752] uppercase tracking-wider block">
                    {item.name}
                  </span>
                  <span
                    className={`text-3xl font-black tracking-tight block mt-1 ${item.valueColor}`}
                  >
                    {item.value}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/60 flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-[#737784] uppercase">
                    {item.month}
                  </span>
                  <span
                    className={`text-[9.5px] font-semibold flex items-center gap-0.5 ${
                      item.isPositive ? "text-emerald-600" : "text-[#BA1A1A]"
                    }`}
                  >
                    {item.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{item.trend}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
