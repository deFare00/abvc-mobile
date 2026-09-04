"use client";

import React, { useState } from "react";
import { Users, Info, AlertTriangle } from "lucide-react";
import { MortalityAgeGroupData } from "@/types/mortality";

interface DeathsByAgeGroupBarProps {
  data: MortalityAgeGroupData[];
}

export default function DeathsByAgeGroupBar({ data }: DeathsByAgeGroupBarProps) {
  const [selectedAge, setSelectedAge] = useState<string>(data[5].ageRange); // Default: 65+ Years
  const maxDeaths = Math.max(...data.map((d) => d.deaths));

  const activeGroup = data.find((d) => d.ageRange === selectedAge) || data[5];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#BA1A1A]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              DEATHS BY AGE GROUP
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Fatality Burden Across Age Cohorts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#BA1A1A] text-[10px] font-bold">
          <AlertTriangle className="w-3 h-3 text-[#BA1A1A]" />
          <span>Vulnerable: 65+ &amp; &lt;5 Yrs</span>
        </div>
      </div>

      {/* Selected Cohort Detail Card */}
      <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
            SELECTED COHORT
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[#191c1e]">{activeGroup.ageRange}</span>
            <span className="text-[10px] font-medium text-[#737784]">
              ({activeGroup.ageCategory})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
              Deaths
            </span>
            <span className="text-xs sm:text-sm font-black text-[#BA1A1A] font-mono">
              {activeGroup.deaths.toLocaleString()}
            </span>
          </div>
          <div className="pl-3 border-l border-[#E2E8F0]">
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
              Cohort CFR
            </span>
            <span className="text-xs sm:text-sm font-black text-[#BA1A1A] font-mono">
              {activeGroup.cfrRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart List */}
      <div className="space-y-2.5 pt-1">
        {data.map((item) => {
          const isSelected = selectedAge === item.ageRange;
          const widthPercent = (item.deaths / maxDeaths) * 100;

          return (
            <div
              key={item.ageRange}
              onClick={() => setSelectedAge(item.ageRange)}
              className={`p-2 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? "bg-rose-50/50 border-[#BA1A1A]/40 shadow-xs"
                  : "bg-transparent hover:bg-[#f8f9fc] border-transparent"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black tracking-tight ${
                      isSelected ? "text-[#BA1A1A]" : "text-[#191c1e]"
                    }`}
                  >
                    {item.ageRange}
                  </span>
                  <span className="text-[10px] text-[#737784]">({item.ageCategory})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-[#BA1A1A]">
                    {item.deaths.toLocaleString()}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#f1f5f9] text-[9px] font-bold text-[#424752] font-mono">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Bar Track */}
              <div className="w-full h-3 bg-[#f1f5f9] rounded-lg border border-[#E2E8F0] overflow-hidden flex p-0.5">
                <div
                  className="h-full rounded-md transition-all duration-700 ease-out bg-gradient-to-r from-[#BA1A1A] to-[#E11D48]"
                  style={{ width: `${Math.max(widthPercent, 5)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[9.5px] text-[#737784] pt-1 border-t border-[#E2E8F0]/70">
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-[#BA1A1A]" />
          <span>Elderly (65+) cohort displays highest mortality burden (30.8%)</span>
        </div>
      </div>
    </div>
  );
}
