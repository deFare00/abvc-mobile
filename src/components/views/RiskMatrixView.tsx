"use client";

import React from "react";
import { Layers, ShieldAlert, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function RiskMatrixView() {
  const categories = [
    {
      level: "Level 4 - Biological Crisis",
      color: "bg-[#850001] text-white",
      borderColor: "border-[#850001]",
      items: ["Ebola / Marburg Viral Hemorrhagic", "Weaponized / Unknown Biological Agent"],
      action: "Activate Total Quarantine & ASEAN BSL-4 Emergency Response Protocol",
    },
    {
      level: "Level 3 - High Alert",
      color: "bg-[#ba1a1a] text-white",
      borderColor: "border-[#ba1a1a]",
      items: ["Mpox Clade Ib (Transmisi Lintas Batas)", "Avian Influenza H5N1 Kluster Manusia"],
      action: "Mandatory port thermal screening & border post isolation",
    },
    {
      level: "Level 2 - Alert",
      color: "bg-[#755a17] text-white",
      borderColor: "border-[#C1A74F]",
      items: ["Nipah Virus Animal Surveillance", "Kolera / Leptospirosis Kluster Pasca Banjir"],
      action: "Enhanced vector surveillance & daily healthcare facility reporting",
    },
    {
      level: "Level 1 - Routine Monitoring (Normal)",
      color: "bg-[#003396] text-white",
      borderColor: "border-[#003396]",
      items: ["Dengue DENV Musiman", "Influenza Musiman"],
      action: "Routine regional media scraping & NLP monitoring",
    },
  ];

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#003396]/10 text-[#003396] rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#003396]">Risk Assessment Matrix</h2>
            <p className="text-[11px] text-[#737784]">ABVC Biological Threat Classification Standard</p>
          </div>
        </div>
        <p className="text-xs text-[#424752] leading-relaxed pt-1">
          This matrix maps clinical impact severity and cross-border transmission probability across Southeast Asia.
        </p>
      </div>

      {/* Matrix Cards */}
      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm space-y-2.5"
          >
            <div className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center justify-between ${cat.color}`}>
              <span>{cat.level}</span>
              <ShieldAlert className="w-4 h-4 opacity-80" />
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-[#737784] uppercase tracking-wider block">
                Associated Pathogens &amp; Diseases:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-[11px] font-semibold text-[#191c1e]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-2.5 bg-[#f8f9fc] rounded-2xl border border-[#E2E8F0] text-[11px] text-[#424752]">
              <span className="font-bold text-[#003396] block mb-0.5">Response SOP:</span>
              {cat.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
