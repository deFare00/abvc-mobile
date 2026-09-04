"use client";

import React from "react";
import { BarChart3, PieChart, Info, Database } from "lucide-react";

export default function DiseaseOverviewView() {
  // Chart 1 Data: Cases Per Disease (All 0 data as requested)
  const diseaseCases = [
    { disease: "Tuberculosis (TB)", cases: 0 },
    { disease: "Dengue Fever", cases: 0 },
    { disease: "Measles", cases: 0 },
    { disease: "COVID-19", cases: 0 },
    { disease: "CHOLERA", cases: 0 },
    { disease: "Leptospirosis", cases: 0 },
    { disease: "RABIES", cases: 0 },
    { disease: "Dengue", cases: 0 },
  ];

  // Chart 2 Data: Country Distribution (All 0 data as requested)
  const countryDistribution = [
    { country: "Philippines", cases: 0, percentage: 0, color: "#0052B4" },
    { country: "Cambodia", cases: 0, percentage: 0, color: "#E60012" },
    { country: "Singapore", cases: 0, percentage: 0, color: "#C1A74F" },
    { country: "Indonesia", cases: 0, percentage: 0, color: "#003396" },
    { country: "Thailand", cases: 0, percentage: 0, color: "#8B5CF6" },
    { country: "Malaysia", cases: 0, percentage: 0, color: "#EC4899" },
    { country: "Vietnam", cases: 0, percentage: 0, color: "#EF4444" },
    { country: "OUTSIDE ASEAN", cases: 0, percentage: 0, color: "#6366F1" },
    { country: "Timor-Leste", cases: 0, percentage: 0, color: "#06B6D4" },
    { country: "Brunei", cases: 0, percentage: 0, color: "#10B981" },
  ];

  const maxScaleValue = 3800000;
  const scaleMarkers = [0, 950000, 1900000, 2850000, 3800000];

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      
      {/* ========================================================= */}
      {/* 1. PAGE HEADER CARD                                       */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#003396]/10 text-[#003396] border border-[#003396]/20 flex items-center justify-center flex-shrink-0 shadow-xs">
            <BarChart3 className="w-5 h-5 text-[#003396]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black text-[#003396] tracking-tight uppercase truncate">
              DISEASE OVERVIEW
            </h2>
            <p className="text-[10.5px] font-medium text-[#737784] truncate">
              Komparasi Kasus &amp; Distribusi Geografis ASEAN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-[10px] font-bold text-[#737784] flex-shrink-0">
          <Database className="w-3 h-3 text-[#003396]" />
          <span>0 Data (Standby)</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CHART 1: CASES PER DISEASE (HORIZONTAL BAR CHART)       */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#003396]"></span>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              CASES PER DISEASE
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-[#737784] uppercase">
            TOTAL: 0 CASES
          </span>
        </div>

        {/* Horizontal Bar Chart Container */}
        <div className="space-y-2.5 pt-1">
          {diseaseCases.map((item) => {
            const barWidthPercent = maxScaleValue > 0 ? (item.cases / maxScaleValue) * 100 : 0;

            return (
              <div key={item.disease} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#424752] truncate max-w-[200px]">
                    {item.disease}
                  </span>
                  <span className="font-black text-[#003396] font-mono text-[11px]">
                    {item.cases.toLocaleString()}
                  </span>
                </div>

                {/* Bar Track & Fill */}
                <div className="w-full h-5 bg-[#f1f5f9] rounded-lg border border-[#E2E8F0] relative overflow-hidden flex items-center">
                  {barWidthPercent > 0 ? (
                    <div
                      className="h-full bg-[#0052B4] rounded-md transition-all duration-500"
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  ) : (
                    <div className="w-1 h-full bg-[#003396]/20" />
                  )}
                  {/* Subtle 0 Baseline Marker */}
                  <span className="absolute left-2 text-[9px] font-bold text-[#94a3b8] pointer-events-none">
                    0
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Scale Labels Matching Screenshot */}
        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[9px] font-mono font-bold text-[#737784] px-1">
          {scaleMarkers.map((marker, index) => (
            <span key={index} className="text-center">
              {marker === 0 ? "0" : marker.toLocaleString()}
            </span>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. CHART 2: COUNTRY DISTRIBUTION (DONUT CHART)            */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#003396]" />
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              COUNTRY DISTRIBUTION
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-[#737784] uppercase">
            10 Wilayah
          </span>
        </div>

        {/* Circular Donut Chart SVG Container */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              {/* Background Donut Ring (Empty State / 0 data) */}
              <circle
                cx="80"
                cy="80"
                r="56"
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="24"
              />
              {/* Subtle Segment Guideline Ring */}
              <circle
                cx="80"
                cy="80"
                r="56"
                fill="transparent"
                stroke="#003396"
                strokeWidth="24"
                strokeDasharray="4 28"
                strokeOpacity="0.12"
              />
            </svg>

            {/* Donut Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-3xl font-black text-[#003396] tracking-tight leading-none">
                0
              </span>
              <span className="text-[9px] font-extrabold text-[#737784] uppercase tracking-wider mt-1">
                TOTAL KASUS
              </span>
              <span className="text-[8.5px] font-semibold text-[#94a3b8] mt-0.5">
                (0%)
              </span>
            </div>
          </div>
        </div>

        {/* Country Breakdown Legend Grid (Matching Screenshot Labels) */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E2E8F0]/70">
          {countryDistribution.map((item) => (
            <div
              key={item.country}
              className="bg-[#f8f9fc] rounded-xl p-2 border border-[#E2E8F0] flex items-center justify-between gap-1.5 shadow-2xs hover:border-[#003396]/30 transition-colors"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] font-bold text-[#191c1e] truncate">
                  {item.country}
                </span>
              </div>
              <span className="text-[10px] font-black text-[#737784] font-mono flex-shrink-0">
                0 (0%)
              </span>
            </div>
          ))}
        </div>

        {/* Footer Info Notice */}
        <div className="pt-2 border-t border-[#E2E8F0]/70 flex items-start gap-1.5 text-[10px] text-[#737784] leading-relaxed">
          <Info className="w-3.5 h-3.5 text-[#003396] flex-shrink-0 mt-0.5" />
          <p>
            Chart saat ini menampilkan 0 data sebagai placeholder, siap menerima konsumsi endpoint API surveilans regional.
          </p>
        </div>
      </div>

    </div>
  );
}
