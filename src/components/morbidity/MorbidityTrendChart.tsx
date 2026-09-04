"use client";

import React, { useState } from "react";
import { TrendingUp, Calendar, Info } from "lucide-react";
import { MorbidityTrendPoint } from "@/types/morbidity";

interface MorbidityTrendChartProps {
  data: MorbidityTrendPoint[];
}

export default function MorbidityTrendChart({ data }: MorbidityTrendChartProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(data.length - 1);

  // Chart Dimensions for SVG
  const width = 460;
  const height = 210;
  const padding = { top: 25, right: 20, bottom: 35, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Min & Max calculations
  const maxCases = Math.max(...data.map((d) => d.cases));
  const maxScale = Math.ceil((maxCases * 1.15) / 5000) * 5000; // 30,000

  // Coordinates calculation
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (item.cases / maxScale) * chartHeight;
    return { ...item, x, y, index };
  });

  // Generate SVG Path
  const linePath = points.reduce((acc, point, idx) => {
    return idx === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  // Generate Area Fill Path
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
          <span className="w-2 h-2 rounded-full bg-[#003396]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              MORBIDITY TREND
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Monthly Caseload Trajectory (Jan – Aug 2026)
            </span>
          </div>
        </div>

        {/* Peak Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#003396] text-[10px] font-extrabold flex-shrink-0">
          <TrendingUp className="w-3 h-3 text-[#003396]" />
          <span>Peak: June (25,480)</span>
        </div>
      </div>

      {/* Selected Data Point Banner */}
      <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#003396]" />
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
              New Cases
            </span>
            <span className="text-xs sm:text-sm font-black text-[#003396] font-mono">
              {activeItem.cases.toLocaleString()}
            </span>
          </div>
          <div className="pl-3 border-l border-[#E2E8F0]">
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
              Active Cases
            </span>
            <span className="text-xs sm:text-sm font-black text-rose-600 font-mono">
              {activeItem.activeCases.toLocaleString()}
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
            {/* Linear Gradient for Line Fill */}
            <linearGradient id="morbidityTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#003396" stopOpacity="0.30" />
              <stop offset="60%" stopColor="#0052B4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#003396" stopOpacity="0.0" />
            </linearGradient>

            {/* Drop Shadow for Line */}
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#003396" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Grid lines and Y-axis labels */}
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
                  {tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#morbidityTrendGradient)" />

          {/* Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#003396"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#shadow)"
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
                {/* Active Halo Indicator */}
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="10"
                    fill="#003396"
                    fillOpacity="0.18"
                    className="animate-pulse"
                  />
                )}

                {/* Outer Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? "6" : "4"}
                  fill={isSelected ? "#003396" : "#ffffff"}
                  stroke="#003396"
                  strokeWidth={isSelected ? "2.5" : "2"}
                  className="transition-all"
                />

                {/* X-axis Month Label */}
                <text
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isSelected ? "#003396" : "#424752"}
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
          <Info className="w-3 h-3 text-[#003396]" />
          <span>Tap data points on chart to inspect monthly metrics</span>
        </div>
        <span className="font-semibold text-[#003396]">Epidemic Wave Trajectory</span>
      </div>
    </div>
  );
}
