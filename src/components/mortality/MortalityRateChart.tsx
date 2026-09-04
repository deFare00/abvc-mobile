"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, Percent, Info } from "lucide-react";
import { MortalityRatePoint } from "@/types/mortality";

interface MortalityRateChartProps {
  data: MortalityRatePoint[];
}

export default function MortalityRateChart({ data }: MortalityRateChartProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(data.length - 1);

  // SVG Dimension Calculations
  const width = 460;
  const height = 210;
  const padding = { top: 25, right: 20, bottom: 35, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxScale = 3.5; // 0 to 3.5%
  const thresholdVal = 2.0;

  // Calculate points
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (item.cfrRate / maxScale) * chartHeight;
    return { ...item, x, y, index };
  });

  // Calculate line path
  const linePath = points.reduce((acc, point, idx) => {
    return idx === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  // Area Path
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Threshold Y
  const thresholdY = padding.top + chartHeight - (thresholdVal / maxScale) * chartHeight;

  // Selected Item
  const activeItem = points[selectedIdx] || points[points.length - 1];

  // Y-axis ticks
  const yTicks = [0, 1.0, 2.0, 3.0];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#BA1A1A]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              MORTALITY RATE (CFR %)
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Weekly Case Fatality Rate vs Alert Benchmark (2.0%)
            </span>
          </div>
        </div>

        {/* Current status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
            activeItem.isAboveThreshold
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {activeItem.isAboveThreshold ? (
            <>
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>ELEVATED CFR</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>CONTROLLED (&lt;2.0%)</span>
            </>
          )}
        </div>
      </div>

      {/* Selected Week Detail */}
      <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#BA1A1A]">
            <Percent className="w-4 h-4 text-[#BA1A1A]" />
          </div>
          <div>
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
              {activeItem.period} (Epi-Week)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-[#BA1A1A] font-mono">
                {activeItem.cfrRate}%
              </span>
              <span className="text-[10px] font-bold text-[#737784]">Case Fatality Rate</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
            Deviation from Benchmark
          </span>
          <span
            className={`text-xs sm:text-sm font-mono font-black ${
              activeItem.cfrRate >= thresholdVal ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {activeItem.cfrRate >= thresholdVal
              ? `+${(activeItem.cfrRate - thresholdVal).toFixed(2)}% Alert`
              : `${(activeItem.cfrRate - thresholdVal).toFixed(2)}% Safe`}
          </span>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: "200px" }}
        >
          <defs>
            <linearGradient id="mortalityRateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BA1A1A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#BA1A1A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const yPos = padding.top + chartHeight - (tick / maxScale) * chartHeight;
            const isThreshold = tick === thresholdVal;

            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={width - padding.right}
                  y2={yPos}
                  stroke={isThreshold ? "#BA1A1A" : "#E2E8F0"}
                  strokeDasharray={isThreshold ? "5 4" : "3 3"}
                  strokeWidth={isThreshold ? "1.5" : "1"}
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fill={isThreshold ? "#BA1A1A" : "#737784"}
                  fontWeight={isThreshold ? "800" : "600"}
                >
                  {tick.toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* Benchmark Label */}
          <text
            x={width - padding.right}
            y={thresholdY - 6}
            textAnchor="end"
            fontSize="9"
            fill="#BA1A1A"
            fontWeight="bold"
          >
            Alert Benchmark: 2.0%
          </text>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#mortalityRateGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#BA1A1A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((pt) => {
            const isSelected = selectedIdx === pt.index;
            const isCritical = pt.isAboveThreshold;

            return (
              <g
                key={pt.shortPeriod}
                className="cursor-pointer"
                onClick={() => setSelectedIdx(pt.index)}
              >
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="10"
                    fill={isCritical ? "#BA1A1A" : "#003396"}
                    fillOpacity="0.2"
                    className="animate-pulse"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? "6" : "4"}
                  fill={isCritical ? "#BA1A1A" : isSelected ? "#BA1A1A" : "#ffffff"}
                  stroke={isCritical ? "#BA1A1A" : "#737784"}
                  strokeWidth={isSelected ? "2.5" : "2"}
                />

                <text
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isSelected ? "#BA1A1A" : "#424752"}
                  fontWeight={isSelected ? "800" : "600"}
                >
                  {pt.shortPeriod}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[9.5px] text-[#737784] pt-1 border-t border-[#E2E8F0]/70">
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-[#BA1A1A]" />
          <span>Regional CFR dropped back below 2.0% benchmark in Weeks 31–32</span>
        </div>
      </div>
    </div>
  );
}
