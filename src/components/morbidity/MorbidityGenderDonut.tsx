"use client";

import React from "react";
import { Users, Info } from "lucide-react";
import { MorbidityGenderDistribution } from "@/types/morbidity";

interface MorbidityGenderDonutProps {
  data: MorbidityGenderDistribution;
  totalCases: number;
}

export default function MorbidityGenderDonut({ data, totalCases }: MorbidityGenderDonutProps) {
  // SVG Donut Calculations
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Male Arc
  const maleLength = (data.malePercentage / 100) * circumference;
  const maleOffset = 0;

  // Female Arc
  const femaleLength = (data.femalePercentage / 100) * circumference;
  const femaleOffset = -maleLength;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#003396]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              GENDER DISTRIBUTION
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Demographic Breakdown by Biological Sex
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-[#737784] text-[10px] font-bold">
          <Users className="w-3 h-3 text-[#003396]" />
          <span>Ratio: 1.13 : 1</span>
        </div>
      </div>

      {/* Donut Chart & Center Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-1">
        {/* SVG Donut */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Circle Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Male Segment (Blue #003396) */}
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

            {/* Female Segment (Rose #E11D48) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E11D48"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${femaleLength} ${circumference}`}
              strokeDashoffset={femaleOffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Donut Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
              TOTAL CASES
            </span>
            <span className="text-base sm:text-lg font-black text-[#191c1e] font-mono leading-tight">
              {(totalCases / 1000).toFixed(1)}k
            </span>
            <span className="text-[9px] font-semibold text-[#003396]">100% Validated</span>
          </div>
        </div>

        {/* Legend & Breakdown Cards */}
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
              <span>Confirmed Cases:</span>
              <span className="font-mono font-bold text-[#191c1e]">
                {data.maleCases.toLocaleString()}
              </span>
            </div>

            {/* Mini Progress Bar */}
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
                <span className="w-3 h-3 rounded-full bg-[#E11D48] ring-2 ring-rose-100 flex-shrink-0"></span>
                <span className="text-xs font-black text-[#191c1e]">Female</span>
              </div>
              <span className="text-xs font-black text-[#E11D48] font-mono">
                {data.femalePercentage.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium text-[#424752]">
              <span>Confirmed Cases:</span>
              <span className="font-mono font-bold text-[#191c1e]">
                {data.femaleCases.toLocaleString()}
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E11D48] rounded-full"
                style={{ width: `${data.femalePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[9.5px] text-[#737784] pt-1 border-t border-[#E2E8F0]/70">
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-[#003396]" />
          <span>Gender-disaggregated clinical records</span>
        </div>
        <span className="font-medium text-[#424752]">Deviation &lt; 0.1%</span>
      </div>
    </div>
  );
}
