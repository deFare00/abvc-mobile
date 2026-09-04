"use client";

import React from "react";
import { Search, RotateCcw, Calendar, Globe2 } from "lucide-react";
import { PheFilterState } from "@/types/publicHealthEvent";

interface PheFilterBarProps {
  filter: PheFilterState;
  onFilterChange: (newFilter: PheFilterState) => void;
  onReset: () => void;
  resultsCount: number;
}

export default function PheFilterBar({
  filter,
  onFilterChange,
  onReset,
  resultsCount,
}: PheFilterBarProps) {
  const regions = [
    "ASEAN",
    "Indonesia",
    "Philippines",
    "Viet Nam",
    "Thailand",
    "Malaysia",
    "Singapore",
    "Cambodia",
  ];

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, region: e.target.value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, endDate: e.target.value });
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3">
      {/* Top Labels / Row */}
      <div className="flex items-center justify-between pb-1 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#003396] uppercase tracking-tight">
          <Globe2 className="w-4 h-4 text-[#003396]" />
          <span>FILTER PUBLIC HEALTH EVENTS</span>
        </div>
        <span className="text-[10px] font-bold text-[#737784]">
          {resultsCount} Events Found
        </span>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Field 1: Region / Country */}
        <div className="space-y-1">
          <label className="block text-[9.5px] font-bold text-[#737784] uppercase tracking-wider pl-1">
            Region / Country
          </label>
          <div className="relative">
            <select
              value={filter.region}
              onChange={handleRegionChange}
              className="w-full h-10 px-3 pr-8 rounded-xl bg-[#f8f9fc] border border-[#E2E8F0] text-xs font-bold text-[#191c1e] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#003396] appearance-none cursor-pointer"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#737784]">
              ▼
            </div>
          </div>
        </div>

        {/* Field 2: Start Date */}
        <div className="space-y-1">
          <label className="block text-[9.5px] font-bold text-[#737784] uppercase tracking-wider pl-1">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filter.startDate}
              onChange={handleStartDateChange}
              className="w-full h-10 px-3 rounded-xl bg-[#f8f9fc] border border-[#E2E8F0] text-xs font-bold text-[#191c1e] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#003396] cursor-pointer"
            />
          </div>
        </div>

        {/* Field 3: End Date */}
        <div className="space-y-1">
          <label className="block text-[9.5px] font-bold text-[#737784] uppercase tracking-wider pl-1">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filter.endDate}
              onChange={handleEndDateChange}
              className="w-full h-10 px-3 rounded-xl bg-[#f8f9fc] border border-[#E2E8F0] text-xs font-bold text-[#191c1e] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#003396] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onReset}
          className="h-9 px-3.5 rounded-xl bg-[#f8f9fc] hover:bg-[#edf2fa] border border-[#E2E8F0] text-xs font-bold text-[#737784] hover:text-[#003396] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          className="h-9 px-5 rounded-xl bg-[#003396] hover:bg-[#002266] text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-[#003396]/20 transition-all active:scale-95 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
}
