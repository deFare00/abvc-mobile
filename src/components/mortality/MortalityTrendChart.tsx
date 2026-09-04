"use client";

import React, { useState } from "react";
import { TrendingDown, Calendar, Info } from "lucide-react";
import { MortalityTrendPoint } from "@/types/mortality";

interface MortalityTrendChartProps {
  data: MortalityTrendPoint[];
}

export default function MortalityTrendChart({ data }: MortalityTrendChartProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(data.length - 1);

  // SVG Chart Dimensions
  const width = 460;
  const height = 210;
  const padding = { top: 25, right: 20, bottom: 35, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Min & Max calculations
  const maxDeaths = Math.max(...data.map((d) => d.deaths));
  const maxScale = Math.ceil((maxDeaths * 1.15) / 100) * 100; // 700

  // Coordinates calculation
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (item.deaths / maxScale) * chartHeight;
    return { ...item, x, y, index };
  });

  // SVG Line & Area Paths
  const linePath = points.reduce((acc, point, idx) => {
    return idx === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Selected item
  const activeItem = points[selectedIdx] || points[points.length - 1];

  // Y-axis ticks
  const yTicks = [0, maxScale * 0.33, maxScale * 0.66, maxScale];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#BA1A1A]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              MORTALITY TREND
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Monthly Fatality Curve (Jan – Aug 2026)
            </span>
          </div>
        </div>

        {/* Peak Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#BA1A1A] text-[10px] font-extrabold flex-shrink-0">
          <TrendingDown className="w-3 h-3 text-[#BA1A1A]" />
          <span>Peak: May (560 Deaths)</span>
        </div>
      </div>

      {/* Selected Data Point Banner */}
      <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#BA1A1A]" />
          <div>
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
              SELECTED PERIOD
            </span>
            <span className="text-xs font-black text-[#191c1e]">{activeItem.fullPeriod}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
              Monthly Deaths
            </span>
            <span className="text-xs sm:text-sm font-black text-[#BA1A1A] font-mono">
              {activeItem.deaths.toLocaleString()}
            </span>
          </div>
          <div className="pl-3 border-l border-[#E2E8F0]">
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
              Period CFR
            </span>
            <span className="text-xs sm:text-sm font-black text-[#191c1e] font-mono">
              {activeItem.caseFatalityRate}%
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: "200px" }}
        >
          <defs>
            <linearGradient id="mortalityTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BA1A1A" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#E11D48" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#BA1A1A" stopOpacity="0.0" />
            </linearGradient>

            <filter id="mortalityShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#BA1A1A" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map((tick, i) => {
            const yPos = padding.top + chartHeight - (tick / maxScale) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={width - padding.right}
                  y2={yPos}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="#737784"
                  fontWeight="600"
                >
                  {tick.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#mortalityTrendGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#BA1A1A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#mortalityShadow)"
          />

          {/* Interactive Data Points */}
          {points.map((pt) => {
            const isSelected = selectedIdx === pt.index;

            return (
              <g
                key={pt.period}
                className="cursor-pointer transition-all"
                onClick={() => setSelectedIdx(pt.index)}
              >
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="10"
                    fill="#BA1A1A"
                    fillOpacity="0.20"
                    className="animate-pulse"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? "6" : "4"}
                  fill={isSelected ? "#BA1A1A" : "#ffffff"}
                  stroke="#BA1A1A"
                  strokeWidth={isSelected ? "2.5" : "2"}
                  className="transition-all"
                />

                <text
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isSelected ? "#BA1A1A" : "#424752"}
                  fontWeight={isSelected ? "800" : "600"}
                >
                  {pt.period}
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
          <span>Tap points on chart to view monthly deaths and CFR</span>
        </div>
        <span className="font-semibold text-emerald-700">Declining Trajectory</span>
      </div>
    </div>
  );
}
