"use client";

import React, { useState } from "react";
import { Activity, Skull, AlertTriangle, Layers } from "lucide-react";

export type SurveillanceCategory = "morbidity" | "mortality" | "phe";

interface SurveillanceCategoriesCardProps {
  onCategorySelect?: (category: SurveillanceCategory) => void;
}

export default function SurveillanceCategoriesCard({
  onCategorySelect,
}: SurveillanceCategoriesCardProps) {
  const [activeCategory, setActiveCategory] = useState<SurveillanceCategory>("morbidity");

  const categories = [
    {
      id: "morbidity" as SurveillanceCategory,
      name: "Morbidity",
      subtitle: "Cases & Trends",
      icon: Activity,
    },
    {
      id: "mortality" as SurveillanceCategory,
      name: "Mortality",
      subtitle: "Fatality & CFR",
      icon: Skull,
    },
    {
      id: "phe" as SurveillanceCategory,
      name: "Public Health Event",
      subtitle: "Outbreak Events",
      icon: AlertTriangle,
    },
  ];

  const handleSelect = (catId: SurveillanceCategory) => {
    setActiveCategory(catId);
    if (onCategorySelect) {
      onCategorySelect(catId);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#003396]/10 text-[#003396] flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#003396]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#003396] uppercase tracking-tight">
              SURVEILLANCE MODULES
            </h3>
          </div>
        </div>
      </div>

      {/* 3 Menu Cards Grid with #003a8a background, #ffffff text, and unified outline styling */}
      <div className="grid grid-cols-3 gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className="flex flex-col items-center justify-between p-2.5 rounded-2xl bg-[#003a8a] hover:bg-[#002f70] border border-white/50 ring-2 ring-[#003a8a]/50 ring-offset-1 shadow-sm text-center group active:scale-[0.97] min-h-[94px] cursor-pointer transition-all"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 bg-white/20 border border-white/30 text-[#ffffff] shadow-xs">
                <Icon className="w-4 h-4 text-[#ffffff]" />
              </div>

              <div className="mt-1.5 w-full">
                <span className="text-[10.5px] font-black text-[#ffffff] block leading-tight tracking-tight">
                  {cat.name}
                </span>
                <span className="text-[9px] font-semibold text-[#ffffff] block mt-0.5 truncate opacity-90">
                  {cat.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
