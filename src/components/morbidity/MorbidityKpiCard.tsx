"use client";

import React from "react";
import { Activity, TrendingUp, CheckCircle2, Users, AlertCircle, Clock } from "lucide-react";
import { MorbiditySummaryKpi } from "@/types/morbidity";

interface MorbidityKpiCardProps {
  kpi: MorbiditySummaryKpi;
}

export default function MorbidityKpiCard({ kpi }: MorbidityKpiCardProps) {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3.5">
      {/* 1. Header: Title */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#003396]/10 text-[#003396] border border-[#003396]/20 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-[#003396]" />
          </div>
          <div>
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
              PRIMARY SURVEILLANCE KPI
            </span>
            <h2 className="text-xs sm:text-sm font-black text-[#003396] uppercase tracking-tight">
              TOTAL MORBIDITY CASES
            </h2>
          </div>
        </div>
      </div>

      {/* 2. Main Cumulative Caseload Hero Display */}
      <div className="bg-gradient-to-br from-[#f8f9fc] via-white to-[#edf2fa] rounded-2xl p-4 border border-[#E2E8F0] shadow-inner space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold text-[#737784] uppercase tracking-wider">
            ASEAN CUMULATIVE CASELOAD
          </span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10.5px] font-black">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{kpi.growthMoMPercent}% MoM</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 pt-0.5">
          <h1 className="text-3xl sm:text-4xl font-black text-[#003396] tracking-tight font-mono leading-none">
            {kpi.totalCases.toLocaleString()}
          </h1>
          <span className="text-xs font-bold text-[#424752]">Confirmed Cases</span>
        </div>

        <p className="text-[10px] font-medium text-[#737784]">
          Validated clinical cases reported across ASEAN member states
        </p>
      </div>

      {/* 3. Three Sub-Metrics (Clean, Un-truncated Layout) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Active Cases */}
        <div className="bg-[#f8f9fc] rounded-2xl p-2.5 sm:p-3 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1 text-rose-600">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[9.5px] font-black uppercase tracking-wider">
              ACTIVE
            </span>
          </div>
          <p className="text-sm sm:text-base font-black text-[#191c1e] font-mono leading-tight">
            {kpi.activeCases.toLocaleString()}
          </p>
          <span className="text-[9px] font-semibold text-[#737784] block truncate">
            {((kpi.activeCases / kpi.totalCases) * 100).toFixed(1)}% in care
          </span>
        </div>

        {/* Recovered Cases */}
        <div className="bg-[#f8f9fc] rounded-2xl p-2.5 sm:p-3 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[9.5px] font-black uppercase tracking-wider">
              RESOLVED
            </span>
          </div>
          <p className="text-sm sm:text-base font-black text-[#191c1e] font-mono leading-tight">
            {kpi.recoveredCases.toLocaleString()}
          </p>
          <span className="text-[9px] font-semibold text-[#737784] block truncate">
            {((kpi.recoveredCases / kpi.totalCases) * 100).toFixed(1)}% recovery
          </span>
        </div>

        {/* Incidence Rate */}
        <div className="bg-[#f8f9fc] rounded-2xl p-2.5 sm:p-3 border border-[#E2E8F0] space-y-1">
          <div className="flex items-center gap-1 text-[#003396]">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[9.5px] font-black uppercase tracking-wider">
              INCIDENCE
            </span>
          </div>
          <p className="text-sm sm:text-base font-black text-[#003396] font-mono leading-tight">
            {kpi.morbidityRatePer100k}
          </p>
          <span className="text-[9px] font-semibold text-[#737784] block truncate">
            per 100k pop.
          </span>
        </div>
      </div>

      {/* 4. Footer: Reporting Period & Live Sync */}
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
