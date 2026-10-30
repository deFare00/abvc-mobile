"use client";

import React from "react";
import { Activity, Layers, Home, History, MapPin } from "lucide-react";

export type NavTab = "signals" | "matrix" | "home" | "history" | "maps";

interface FooterNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function FooterNav({ activeTab, onTabChange }: FooterNavProps) {
  const tabs = [
    { id: "signals" as NavTab, label: "Sinyal", icon: Activity },
    { id: "matrix" as NavTab, label: "Matriks", icon: Layers },
    { id: "home" as NavTab, label: "Beranda", icon: Home, isCenter: true },
    { id: "history" as NavTab, label: "Riwayat", icon: History },
    { id: "maps" as NavTab, label: "Peta", icon: MapPin },
  ];

  return (
    <nav aria-label="Navigasi Utama" className="sticky bottom-0 z-40 w-full bg-white border-t border-[#E2E8F0] shadow-lg select-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-[430px] mx-auto px-2 pt-1 pb-1 flex items-center justify-around relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className="relative -top-3 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                    isActive
                      ? "bg-gradient-to-tr from-[#003396] to-[#0052B4] text-white ring-4 ring-[#003396]/20 scale-105"
                      : "bg-[#003396] text-white hover:bg-[#002266]"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-[10.5px] font-extrabold mt-1 tracking-tight transition-colors ${
                    isActive ? "text-[#003396]" : "text-[#737784] group-hover:text-[#003396]"
                  }`}
                >
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
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all group focus:outline-none"
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive
                    ? "text-[#003396] bg-[#003396]/10"
                    : "text-[#737784] group-hover:text-[#003396] group-hover:bg-[#f8f9fc]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span
                className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors ${
                  isActive ? "text-[#003396] font-extrabold" : "text-[#737784] group-hover:text-[#003396]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
