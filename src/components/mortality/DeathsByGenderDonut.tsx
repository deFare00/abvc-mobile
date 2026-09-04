"use client";

import React from "react";
import { Users, Info } from "lucide-react";
import { MortalityGenderDistribution } from "@/types/mortality";

interface DeathsByGenderDonutProps {
  data: MortalityGenderDistribution;
  totalDeaths: number;
}

export default function DeathsByGenderDonut({ data, totalDeaths }: DeathsByGenderDonutProps) {
  // SVG Donut Calculations
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Male Arc (Navy Blue #003396)
  const maleLength = (data.malePercentage / 100) * circumference;
  const maleOffset = 0;

  // Female Arc (Rose/Crimson #BA1A1A)
  const femaleLength = (data.femalePercentage / 100) * circumference;
  const femaleOffset = -maleLength;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#BA1A1A]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              DEATHS BY GENDER
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Fatality Disaggregation by Sex
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-[#737784] text-[10px] font-bold">
          <Users className="w-3 h-3 text-[#BA1A1A]" />
          <span>Ratio: {data.sexRatio}</span>
        </div>
      </div>

      {/* Donut Chart & Center Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-1">
        {/* SVG Donut */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Male Segment (Navy Blue #003396) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#003396"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${maleLength} ${circumference}`}
              strokeDashoffset={maleOffset}
              className="transition-all duration-700 ease-out"
            />

            {/* Female Segment (Crimson #BA1A1A) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#BA1A1A"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${femaleLength} ${circumference}`}
              strokeDashoffset={femaleOffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
              TOTAL DEATHS
            </span>
            <span className="text-base sm:text-lg font-black text-[#191c1e] font-mono leading-tight">
              {totalDeaths.toLocaleString()}
            </span>
            <span className="text-[9px] font-semibold text-[#BA1A1A]">100% Verified</span>
          </div>
        </div>

        {/* Legend Cards */}
        <div className="w-full sm:w-auto flex-1 space-y-2.5">
          {/* Male Card */}
          <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] space-y-1.5 transition-all hover:bg-white hover:shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#003396] ring-2 ring-blue-100 flex-shrink-0"></span>
                <span className="text-xs font-black text-[#191c1e]">Male</span>
              </div>
              <span className="text-xs font-black text-[#003396] font-mono">
                {data.malePercentage.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-[#424752]">
              <span>Verified Fatalities:</span>
              <span className="font-mono font-bold text-[#191c1e]">
                {data.maleDeaths.toLocaleString()}
              </span>
            </div>

            <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#003396] rounded-full"
                style={{ width: `${data.malePercentage}%` }}
              />
            </div>
          </div>

          {/* Female Card */}
          <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] space-y-1.5 transition-all hover:bg-white hover:shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#BA1A1A] ring-2 ring-rose-100 flex-shrink-0"></span>
                <span className="text-xs font-black text-[#191c1e]">Female</span>
              </div>
              <span className="text-xs font-black text-[#BA1A1A] font-mono">
                {data.femalePercentage.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-[#424752]">
              <span>Verified Fatalities:</span>
              <span className="font-mono font-bold text-[#191c1e]">
                {data.femaleDeaths.toLocaleString()}
              </span>
            </div>

            <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#BA1A1A] rounded-full"
                style={{ width: `${data.femalePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[9.5px] text-[#737784] pt-1 border-t border-[#E2E8F0]/70">
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-[#BA1A1A]" />
          <span>Biological sex-disaggregated clinical mortality data</span>
        </div>
        <span className="font-medium text-[#424752]">Margin &lt; 0.1%</span>
      </div>
    </div>
  );
}
