"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, Activity, Info } from "lucide-react";
import { MorbidityRatePoint } from "@/types/morbidity";

interface MorbidityRateChartProps {
  data: MorbidityRatePoint[];
}

export default function MorbidityRateChart({ data }: MorbidityRateChartProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(data.length - 1);

  // SVG Dimension Calculations
  const width = 460;
  const height = 210;
  const padding = { top: 25, right: 20, bottom: 35, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxScale = 70; // 0 to 70 per 100k
  const thresholdVal = 50.0;

  // Calculate points
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (item.ratePer100k / maxScale) * chartHeight;
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
  const yTicks = [0, 20, 40, 50, 60];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#003396]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              MORBIDITY RATE (PER 100K)
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Weekly Incidence vs Epidemic Threshold (50.0)
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
              <span>ABOVE THRESHOLD</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>CONTROLLED (SAFE)</span>
            </>
          )}
        </div>
      </div>

      {/* Selected Week Detail */}
      <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#003396]">
            <Activity className="w-4 h-4 text-[#003396]" />
          </div>
          <div>
            <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
              {activeItem.period} (Epi-Week)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-[#003396] font-mono">
                {activeItem.ratePer100k}
              </span>
              <span className="text-[10px] font-bold text-[#737784]">per 100,000 population</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
            Variance from Threshold
          </span>
          <span
            className={`text-xs sm:text-sm font-mono font-black ${
              activeItem.ratePer100k >= thresholdVal ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {activeItem.ratePer100k >= thresholdVal
              ? `+${(activeItem.ratePer100k - thresholdVal).toFixed(1)} Points`
              : `${(activeItem.ratePer100k - thresholdVal).toFixed(1)} Points`}
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
            <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#003396" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#003396" stopOpacity="0.0" />
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
                  stroke={isThreshold ? "#E11D48" : "#E2E8F0"}
                  strokeDasharray={isThreshold ? "5 4" : "3 3"}
                  strokeWidth={isThreshold ? "1.5" : "1"}
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fill={isThreshold ? "#E11D48" : "#737784"}
                  fontWeight={isThreshold ? "800" : "600"}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Threshold Label in chart */}
          <text
            x={width - padding.right}
            y={thresholdY - 6}
            textAnchor="end"
            fontSize="9"
            fill="#E11D48"
            fontWeight="bold"
          >
            Epidemic Threshold: 50.0
          </text>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#rateGradient)" />

          {/* Rate Curve */}
          <path
            d={linePath}
            fill="none"
            stroke="#003396"
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
                    fill={isCritical ? "#E11D48" : "#003396"}
                    fillOpacity="0.2"
                    className="animate-pulse"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? "6" : "4"}
                  fill={isCritical ? "#E11D48" : isSelected ? "#003396" : "#ffffff"}
                  stroke={isCritical ? "#BA1A1A" : "#003396"}
                  strokeWidth={isSelected ? "2.5" : "2"}
                />

                {/* X-axis label */}
                <text
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isSelected ? "#003396" : "#424752"}
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
          <Info className="w-3 h-3 text-[#003396]" />
          <span>Weeks 28 &amp; 29 briefly exceeded epidemic threshold before flattening</span>
        </div>
      </div>
    </div>
  );
}
