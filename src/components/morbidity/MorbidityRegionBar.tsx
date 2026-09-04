"use client";

import React from "react";
import { Globe2, BarChart3 } from "lucide-react";
import { MorbidityRegionData } from "@/types/morbidity";

interface MorbidityRegionBarProps {
  data: MorbidityRegionData[];
  totalCases: number;
}

export default function MorbidityRegionBar({ data, totalCases }: MorbidityRegionBarProps) {
  const maxCases = Math.max(...data.map((d) => d.cases));

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#003396]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              MORBIDITY BY REGION
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Geographic Caseload in ASEAN Region
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#003396] text-[10px] font-bold">
          <Globe2 className="w-3 h-3 text-[#003396]" />
          <span>7 Regional Clusters</span>
        </div>
      </div>

      {/* Horizontal Bar Chart List */}
      <div className="space-y-3 pt-1">
        {data.map((item, index) => {
          const widthPercent = (item.cases / maxCases) * 100;

          return (
            <div key={item.id} className="space-y-1.5 group">
              {/* Row Label: Country, Region, Rank & Count */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[#f1f5f9] border border-[#E2E8F0] flex items-center justify-center text-[9.5px] font-extrabold text-[#737784] flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-[#191c1e] block truncate">
                      {item.country}
                    </span>
                    <span className="text-[9.5px] text-[#737784] block truncate">
                      {item.regionName}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="font-mono font-black text-[#003396] text-xs">
                      {item.cases.toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#f1f5f9] text-[9.5px] font-bold text-[#424752] font-mono">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3.5 bg-[#f1f5f9] rounded-lg border border-[#E2E8F0] relative overflow-hidden flex items-center p-0.5">
                <div
                  className="h-full rounded-md transition-all duration-700 ease-out flex items-center justify-end pr-1.5"
                  style={{
                    width: `${Math.max(widthPercent, 4)}%`,
                    backgroundColor: item.color,
                  }}
                >
                  {widthPercent > 20 && (
                    <span className="text-[8px] font-black text-white/95 drop-shadow-xs">
                      {item.flagCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex items-center justify-between text-[10.5px]">
        <div className="flex items-center gap-1.5 text-[#424752]">
          <BarChart3 className="w-4 h-4 text-[#003396]" />
          <span className="font-medium">Total Regional Caseload:</span>
        </div>
        <span className="font-mono font-black text-[#003396] text-xs">
          {totalCases.toLocaleString()} Cases (100%)
        </span>
      </div>
    </div>
  );
}
