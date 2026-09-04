"use client";

import React from "react";
import { Activity, AlertOctagon, BarChart2 } from "lucide-react";
import { MortalityCauseData } from "@/types/mortality";

interface DeathsByCauseBarProps {
  data: MortalityCauseData[];
  totalDeaths: number;
}

export default function DeathsByCauseBar({ data, totalDeaths }: DeathsByCauseBarProps) {
  const maxDeaths = Math.max(...data.map((d) => d.deaths));

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#BA1A1A]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              DEATHS BY CAUSE
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Primary Pathogenic &amp; Clinical Etiologies
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#BA1A1A] text-[10px] font-bold">
          <AlertOctagon className="w-3 h-3 text-[#BA1A1A]" />
          <span>Severe Dengue #1</span>
        </div>
      </div>

      {/* Bar List */}
      <div className="space-y-3 pt-1">
        {data.map((item, index) => {
          const widthPercent = (item.deaths / maxDeaths) * 100;

          return (
            <div key={item.id} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-[11px]">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#191c1e] truncate block">
                      {item.causeName}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-[#737784] truncate block">
                    {item.pathogenType}
                  </span>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="font-mono font-black text-[#BA1A1A] text-xs">
                      {item.deaths.toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#f1f5f9] text-[9.5px] font-bold text-[#424752] font-mono">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3 bg-[#f1f5f9] rounded-lg border border-[#E2E8F0] overflow-hidden flex p-0.5">
                <div
                  className="h-full rounded-md transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(widthPercent, 5)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex items-center justify-between text-[10.5px]">
        <div className="flex items-center gap-1.5 text-[#424752]">
          <BarChart2 className="w-4 h-4 text-[#BA1A1A]" />
          <span className="font-medium">Total Etiological Fatalities:</span>
        </div>
        <span className="font-mono font-black text-[#BA1A1A] text-xs">
          {totalDeaths.toLocaleString()} (100%)
        </span>
      </div>
    </div>
  );
}
