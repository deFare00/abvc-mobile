"use client";

import React, { useState } from "react";
import { Activity, RefreshCw, TrendingUp, Users, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { mockMorbidityData } from "@/data/morbidityData";
import MorbidityKpiCard from "@/components/morbidity/MorbidityKpiCard";
import MorbidityTrendChart from "@/components/morbidity/MorbidityTrendChart";
import MorbidityGenderDonut from "@/components/morbidity/MorbidityGenderDonut";
import MorbidityRegionBar from "@/components/morbidity/MorbidityRegionBar";
import MorbidityAgeGenderStacked from "@/components/morbidity/MorbidityAgeGenderStacked";
import MorbidityRateChart from "@/components/morbidity/MorbidityRateChart";
import MorbidityMap from "@/components/morbidity/MorbidityMap";

export type MorbiditySection = "overview" | "trends" | "demographics" | "geospatial";

export default function MorbidityView() {
  const [data] = useState(mockMorbidityData);
  const [activeSection, setActiveSection] = useState<MorbiditySection>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sections: { id: MorbiditySection; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", shortLabel: "KPI & Rate", icon: Activity },
    { id: "trends", label: "Trends", shortLabel: "Monthly", icon: TrendingUp },
    { id: "demographics", label: "Demographics", shortLabel: "Age/Sex", icon: Users },
    { id: "geospatial", label: "Maps & Region", shortLabel: "Hotspots", icon: MapPin },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const currentSectionIdx = sections.findIndex((s) => s.id === activeSection);
  const prevSection = currentSectionIdx > 0 ? sections[currentSectionIdx - 1] : null;
  const nextSection = currentSectionIdx < sections.length - 1 ? sections[currentSectionIdx + 1] : null;

  return (
    <div className="space-y-3.5 pb-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* 1. TOP HEADER CARD (COMPACT & CLEAN)                      */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#003396] text-white flex items-center justify-center shadow-md shadow-[#003396]/20 flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-black tracking-widest text-[#003396] uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  SURVEILLANCE
                </span>
                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-[#191c1e] tracking-tight leading-snug mt-0.5 truncate">
                MORBIDITY DASHBOARD
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="w-8 h-8 rounded-full bg-[#f8f9fc] hover:bg-[#edf2fa] border border-[#E2E8F0] flex items-center justify-center text-[#737784] hover:text-[#003396] transition-all active:scale-95 shadow-xs flex-shrink-0"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#003396] ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SECTION NAVIGATOR (NON-SCROLLABLE TAB SWITCHER)         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? "bg-[#003396] text-white shadow-xs font-black"
                  : "bg-transparent text-[#424752] hover:bg-[#f1f5f9] hover:text-[#003396] font-bold"
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? "text-white" : "text-[#737784]"}`} />
              <span className="text-[10px] tracking-tight leading-none truncate w-full text-center">
                {sec.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 3. SECTION CONTENT (MODULAR & COMPACT)                     */}
      {/* ========================================================= */}
      
      {/* SECTION 1: OVERVIEW (KPI & OUTBREAK RATE) */}
      {activeSection === "overview" && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <MorbidityKpiCard kpi={data.kpi} />
          <MorbidityRateChart data={data.morbidityRates} />
        </div>
      )}

      {/* SECTION 2: TRENDS (MONTHLY TRAJECTORY & WAVE ANALYSIS) */}
      {activeSection === "trends" && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <MorbidityTrendChart data={data.trend} />
          
          {/* Quick Insights Pill for Trends */}
          <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm space-y-2">
            <span className="text-[10px] font-black text-[#003396] uppercase tracking-wider block">
              EPIDEMIOLOGICAL TRAJECTORY SUMMARY
            </span>
            <p className="text-xs text-[#424752] leading-relaxed">
              Caseload demonstrated a progressive upward trajectory starting from <strong className="text-[#191c1e]">January (11,420 cases)</strong>, reaching a regional second-wave peak in <strong className="text-[#003396]">June (25,480 cases)</strong> before declining into August (20,400 cases).
            </p>
          </div>
        </div>
      )}

      {/* SECTION 3: DEMOGRAPHICS (GENDER & AGE STACKED) */}
      {activeSection === "demographics" && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <MorbidityGenderDonut data={data.gender} totalCases={data.kpi.totalCases} />
          <MorbidityAgeGenderStacked data={data.ageGender} />
        </div>
      )}

      {/* SECTION 4: GEOSPATIAL & REGIONAL HOTSPOTS */}
      {activeSection === "geospatial" && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <MorbidityMap areas={data.topAffectedAreas} />
          <MorbidityRegionBar data={data.regions} totalCases={data.kpi.totalCases} />
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SECTION QUICK SWITCHER / FOOTER NAVIGATION             */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between pt-1">
        {prevSection ? (
          <button
            type="button"
            onClick={() => setActiveSection(prevSection.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[10.5px] font-bold text-[#424752] hover:text-[#003396] shadow-xs active:scale-95 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{prevSection.label}</span>
          </button>
        ) : (
          <div />
        )}

        <span className="text-[10px] font-semibold text-[#737784]">
          Section {currentSectionIdx + 1} of {sections.length}
        </span>

        {nextSection ? (
          <button
            type="button"
            onClick={() => setActiveSection(nextSection.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#003396] text-white text-[10.5px] font-black shadow-xs active:scale-95 transition-all"
          >
            <span>{nextSection.label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveSection("overview")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-[10.5px] font-bold text-[#003396] shadow-xs active:scale-95 transition-all"
          >
            <span>Back to Overview</span>
          </button>
        )}
      </div>
    </div>
  );
}
