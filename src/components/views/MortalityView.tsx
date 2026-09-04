"use client";

import React, { useState } from "react";
import { Skull, RefreshCw, TrendingDown, Users, Globe2, Percent, ChevronRight, ChevronLeft } from "lucide-react";
import { mockMortalityData } from "@/data/mortalityData";
import MortalityKpiCard from "@/components/mortality/MortalityKpiCard";
import MortalityTrendChart from "@/components/mortality/MortalityTrendChart";
import DeathsByAgeGroupBar from "@/components/mortality/DeathsByAgeGroupBar";
import DeathsByGenderDonut from "@/components/mortality/DeathsByGenderDonut";
import DeathsByRegionBar from "@/components/mortality/DeathsByRegionBar";
import DeathsByCauseBar from "@/components/mortality/DeathsByCauseBar";
import AgeGenderMortalityStacked from "@/components/mortality/AgeGenderMortalityStacked";
import MortalityRateChart from "@/components/mortality/MortalityRateChart";

export type MortalitySection = "overview" | "trends" | "demographics" | "causes";

export default function MortalityView() {
  const [data] = useState(mockMortalityData);
  const [activeSection, setActiveSection] = useState<MortalitySection>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sections: {
    id: MortalitySection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "overview", label: "Overview", icon: Percent },
    { id: "trends", label: "Trends", icon: TrendingDown },
    { id: "demographics", label: "Demographics", icon: Users },
    { id: "causes", label: "Causes & Region", icon: Globe2 },
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
            <div className="w-10 h-10 rounded-2xl bg-[#BA1A1A] text-white flex items-center justify-center shadow-md shadow-[#BA1A1A]/20 flex-shrink-0">
              <Skull className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-black tracking-widest text-[#BA1A1A] uppercase bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  SURVEILLANCE
                </span>
                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-[#191c1e] tracking-tight leading-snug mt-0.5 truncate">
                MORTALITY DASHBOARD
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="w-8 h-8 rounded-full bg-[#f8f9fc] hover:bg-[#edf2fa] border border-[#E2E8F0] flex items-center justify-center text-[#737784] hover:text-[#BA1A1A] transition-all active:scale-95 shadow-xs flex-shrink-0"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#BA1A1A] ${isRefreshing ? "animate-spin" : ""}`}
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
                  ? "bg-[#BA1A1A] text-white shadow-xs font-black"
                  : "bg-transparent text-[#424752] hover:bg-[#f1f5f9] hover:text-[#BA1A1A] font-bold"
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

      {/* SECTION 1: OVERVIEW & RATES (KPI CARD + CFR RATE CHART) */}
      {activeSection === "overview" && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <MortalityKpiCard kpi={data.kpi} />
          <MortalityRateChart data={data.mortalityRates} />
        </div>
      )}

      {/* SECTION 2: TRENDS (MONTHLY FATALITY TRAJECTORY) */}
      {activeSection === "trends" && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <MortalityTrendChart data={data.trend} />

          <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm space-y-2">
            <span className="text-[10px] font-black text-[#BA1A1A] uppercase tracking-wider block">
              FATALITY TRAJECTORY INSIGHTS
            </span>
            <p className="text-xs text-[#424752] leading-relaxed">
              Mortality escalated from <strong className="text-[#191c1e]">January (240 deaths)</strong> to a regional second-wave crest in <strong className="text-[#BA1A1A]">May (560 deaths)</strong>, followed by steady clinical decompression through August (250 deaths, CFR 1.22%).
            </p>
          </div>
        </div>
      )}

      {/* SECTION 3: DEMOGRAPHICS (GENDER DONUT + AGE BARS + STACKED) */}
      {activeSection === "demographics" && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <DeathsByGenderDonut data={data.gender} totalDeaths={data.kpi.totalDeaths} />
          <DeathsByAgeGroupBar data={data.ageGroups} />
          <AgeGenderMortalityStacked data={data.ageGenderStacked} />
        </div>
      )}

      {/* SECTION 4: CAUSES & REGIONS */}
      {activeSection === "causes" && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <DeathsByCauseBar data={data.causes} totalDeaths={data.kpi.totalDeaths} />
          <DeathsByRegionBar data={data.regions} totalDeaths={data.kpi.totalDeaths} />
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[10.5px] font-bold text-[#424752] hover:text-[#BA1A1A] shadow-xs active:scale-95 transition-all cursor-pointer"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#BA1A1A] text-white text-[10.5px] font-black shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <span>{nextSection.label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveSection("overview")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-[10.5px] font-bold text-[#BA1A1A] shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <span>Back to Overview</span>
          </button>
        )}
      </div>
    </div>
  );
}
