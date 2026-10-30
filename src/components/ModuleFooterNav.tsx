"use client";

import React from "react";
import { Radio, BarChart3, TrendingUp } from "lucide-react";

export type ModuleNavTab = "ebs" | "ibs" | "analysis";

interface ModuleFooterNavProps {
  activeTab?: ModuleNavTab;
  onTabChange: (tab: ModuleNavTab) => void;
}

export default function ModuleFooterNav({
  activeTab,
  onTabChange,
}: ModuleFooterNavProps) {
  const tabs = [
    { id: "ebs" as ModuleNavTab, label: "EBS", icon: Radio },
    { id: "ibs" as ModuleNavTab, label: "IBS", icon: BarChart3 },
    { id: "analysis" as ModuleNavTab, label: "Analysis", icon: TrendingUp },
  ];

  return (
    <footer className="flex-shrink-0 z-40 w-full bg-white border-t border-[#E2E8F0] shadow-lg select-none pb-[env(safe-area-inset-bottom,4px)] pt-1 overflow-visible">
      <div className="max-w-[430px] mx-auto px-6 pt-1 pb-1 flex items-center justify-around relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (isActive) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
              >
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-300 shadow-md bg-gradient-to-tr from-[#003396] to-[#0052B4] text-white ring-4 ring-[#003396]/20 scale-105 group-hover:scale-110 group-active:scale-95">
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10.5px] font-extrabold mt-1 tracking-tight text-[#003396] transition-colors">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all group focus:outline-none"
            >
              <div className="p-1 rounded-lg text-[#737784] group-hover:text-[#003396] group-hover:bg-[#f8f9fc] transition-colors">
                <Icon className="w-5 h-5 stroke-[1.8] group-hover:scale-105 transition-transform" />
              </div>
              <span className="text-[10px] sm:text-[10.5px] font-bold mt-0.5 tracking-tight text-[#737784] group-hover:text-[#003396] transition-colors">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}

