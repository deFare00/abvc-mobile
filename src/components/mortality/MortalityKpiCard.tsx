"use client";

import React from "react";
import { Skull, TrendingDown, Percent, AlertOctagon, CheckCircle2, Clock } from "lucide-react";
import { MortalitySummaryKpi } from "@/types/mortality";

interface MortalityKpiCardProps {
  kpi: MortalitySummaryKpi;
}

export default function MortalityKpiCard({ kpi }: MortalityKpiCardProps) {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3.5">
      {/* 1. Header: Clean Title (No awkward status badges) */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#BA1A1A]/10 text-[#BA1A1A] border border-[#BA1A1A]/20 flex items-center justify-center flex-shrink-0">
            <Skull className="w-4 h-4 text-[#BA1A1A]" />
          </div>
          <div>
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
              PRIMARY SURVEILLANCE KPI
            </span>
            <h2 className="text-xs sm:text-sm font-black text-[#BA1A1A] uppercase tracking-tight">
              TOTAL DEATHS
            </h2>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#737784] uppercase tracking-wider">
          FATALITY BURDEN
        </span>
      </div>

      {/* 2. Main Hero Metric: Cumulative Deaths & MoM Trend */}
      <div className="bg-gradient-to-br from-[#f8f9fc] via-white to-[#fdf2f2] rounded-2xl p-4 border border-[#E2E8F0] shadow-inner space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold text-[#737784] uppercase tracking-wider">
            ASEAN CUMULATIVE MORTALITY
          </span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-black">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{kpi.growthMoMPercent}% MoM</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 pt-0.5">
          <h1 className="text-3xl sm:text-4xl font-black text-[#BA1A1A] tracking-tight font-mono leading-none">
            {kpi.totalDeaths.toLocaleString()}
          </h1>
          <span className="text-xs font-bold text-[#424752]">Verified Fatalities</span>
        </div>

        <p className="text-[10px] font-medium text-[#737784]">
          Clinical &amp; post-mortem confirmed deaths across ASEAN member states
        </p>
      </div>

      {/* 3. Three Sub-Metrics (Clean & Compact) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Case Fatality Rate */}
        <div className="bg-[#f8f9fc] rounded-2xl p-2.5 sm:p-3 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1 text-[#BA1A1A]">
            <Percent className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[9.5px] font-black uppercase tracking-wider">
              CFR RATE
            </span>
          </div>
          <p className="text-sm sm:text-base font-black text-[#BA1A1A] font-mono leading-tight">
            {kpi.caseFatalityRate}%
          </p>
          <span className="text-[9px] font-semibold text-[#737784] block truncate">
            Case Fatality Rate
          </span>
        </div>

        {/* ICU / Critical */}
        <div className="bg-[#f8f9fc] rounded-2xl p-2.5 sm:p-3 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1 text-amber-600">
            <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[9.5px] font-black uppercase tracking-wider">
              ICU CRITICAL
            </span>
          </div>
          <p className="text-sm sm:text-base font-black text-[#191c1e] font-mono leading-tight">
            {kpi.icuCriticalCases.toLocaleString()}
          </p>
          <span className="text-[9px] font-semibold text-[#737784] block truncate">
            Under Intensive Care
          </span>
        </div>

        {/* Verified Rate */}
        <div className="bg-[#f8f9fc] rounded-2xl p-2.5 sm:p-3 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[9.5px] font-black uppercase tracking-wider">
              LAB VERIFIED
            </span>
          </div>
          <p className="text-sm sm:text-base font-black text-emerald-700 font-mono leading-tight">
            {kpi.laboratoryVerifiedRate}%
          </p>
          <span className="text-[9px] font-semibold text-[#737784] block truncate">
            Confirmed Etiology
          </span>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between text-[9.5px] text-[#737784] pt-1 border-t border-[#E2E8F0]/70">
        <span className="font-medium">Period: {kpi.periodLabel}</span>
        <div className="flex items-center gap-1 font-medium">
          <Clock className="w-3 h-3 text-[#737784]" />
          <span>Sync: {kpi.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
