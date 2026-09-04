"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import { MorbidityAgeGenderGroup } from "@/types/morbidity";

interface MorbidityAgeGenderStackedProps {
  data: MorbidityAgeGenderGroup[];
}

export default function MorbidityAgeGenderStacked({ data }: MorbidityAgeGenderStackedProps) {
  const [selectedAge, setSelectedAge] = useState<string>(data[3].ageRange); // Default: 25 - 44 Years

  const maxTotal = Math.max(...data.map((d) => d.totalCases));
  const activeGroup = data.find((d) => d.ageRange === selectedAge) || data[0];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#003396]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              CASES BY AGE &amp; GENDER
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Demographic Breakdown Across Age Brackets
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#003396]"></span>
            <span className="text-[#424752]">Male</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]"></span>
            <span className="text-[#424752]">Female</span>
          </div>
        </div>
      </div>

      {/* Selected Age Group Detail Pill */}
      <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
            SELECTED BRACKET
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[#191c1e]">{activeGroup.ageRange}</span>
            <span className="text-[10px] font-medium text-[#737784]">
              ({activeGroup.ageCategory})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-right">
          <div className="bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
            <span className="text-[8.5px] font-bold text-[#003396] block uppercase">Male</span>
            <span className="text-[11px] font-mono font-black text-[#003396]">
              {activeGroup.maleCases.toLocaleString()}
            </span>
          </div>

          <div className="bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
            <span className="text-[8.5px] font-bold text-[#E11D48] block uppercase">Female</span>
            <span className="text-[11px] font-mono font-black text-[#E11D48]">
              {activeGroup.femaleCases.toLocaleString()}
            </span>
          </div>

          <div className="bg-white px-2 py-1 rounded-lg border border-[#E2E8F0]">
            <span className="text-[8.5px] font-bold text-[#737784] block uppercase">Total</span>
            <span className="text-[11px] font-mono font-black text-[#191c1e]">
              {activeGroup.totalCases.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stacked Bars List */}
      <div className="space-y-2.5 pt-1">
        {data.map((item) => {
          const isSelected = selectedAge === item.ageRange;
          const totalWidthPercent = (item.totalCases / maxTotal) * 100;
          const maleProportion = (item.maleCases / item.totalCases) * 100;
          const femaleProportion = (item.femaleCases / item.totalCases) * 100;

          return (
            <div
              key={item.ageRange}
              onClick={() => setSelectedAge(item.ageRange)}
              className={`p-2 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? "bg-blue-50/50 border-[#003396]/40 shadow-xs"
                  : "bg-transparent hover:bg-[#f8f9fc] border-transparent"
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black tracking-tight ${
                      isSelected ? "text-[#003396]" : "text-[#191c1e]"
                    }`}
                  >
                    {item.ageRange}
                  </span>
                  <span className="text-[10px] text-[#737784]">({item.ageCategory})</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-xs text-[#191c1e]">
                    {item.totalCases.toLocaleString()}
                  </span>
                  <span className="text-[9.5px] font-bold text-[#737784]">cases</span>
                </div>
              </div>

              {/* Stacked Bar Track */}
              <div className="w-full h-4 bg-[#f1f5f9] rounded-lg border border-[#E2E8F0] overflow-hidden flex p-0.5">
                <div
                  className="h-full flex rounded-md overflow-hidden transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(totalWidthPercent, 8)}%` }}
                >
                  {/* Male Stack Segment */}
                  <div
                    className="h-full bg-[#003396] transition-all hover:opacity-90 flex items-center justify-center text-[7.5px] font-black text-white"
                    style={{ width: `${maleProportion}%` }}
                    title={`Male: ${item.maleCases.toLocaleString()} (${maleProportion.toFixed(0)}%)`}
                  >
                    {maleProportion > 25 && `${maleProportion.toFixed(0)}%`}
                  </div>

                  {/* Female Stack Segment */}
                  <div
                    className="h-full bg-[#E11D48] transition-all hover:opacity-90 flex items-center justify-center text-[7.5px] font-black text-white"
                    style={{ width: `${femaleProportion}%` }}
                    title={`Female: ${item.femaleCases.toLocaleString()} (${femaleProportion.toFixed(0)}%)`}
                  >
                    {femaleProportion > 25 && `${femaleProportion.toFixed(0)}%`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[9.5px] text-[#737784] pt-1 border-t border-[#E2E8F0]/70">
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-[#003396]" />
          <span>Working-age population (25-44 yrs) accounts for highest caseload (29.7%)</span>
        </div>
      </div>
    </div>
  );
}
