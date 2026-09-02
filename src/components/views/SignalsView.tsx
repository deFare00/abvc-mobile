"use client";

import React, { useState } from "react";
import { Activity, Search, ShieldCheck, Filter, Globe, ChevronRight } from "lucide-react";
import { OutbreakSignal } from "@/types/surveillance";

interface SignalsViewProps {
  signals: OutbreakSignal[];
  onOpenNlpModal: () => void;
}

export default function SignalsView({ signals, onOpenNlpModal }: SignalsViewProps) {
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("Semua");

  const filtered = signals.filter((s) => {
    const matchSearch =
      s.disease.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());

    const matchLevel = filterLevel === "Semua" || s.threatLevel === filterLevel;

    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#003396]/10 text-[#003396] rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#003396]">Sinyal Surveilans Wabah</h2>
              <p className="text-[11px] text-[#737784]">Aliran Deteksi Real-Time Kawasan ASEAN</p>
            </div>
          </div>
          <button
            onClick={onOpenNlpModal}
            className="px-3 py-1.5 bg-[#003396] text-white font-bold text-xs rounded-full shadow hover:bg-[#002266] transition-all"
          >
            + Analisis NLP
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari penyakit, patogen, atau lokasi..."
            className="w-full h-10 px-4 pl-9 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-xs text-[#191c1e] placeholder:text-[#737784] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003396]"
          />
          <Search className="w-4 h-4 text-[#737784] absolute left-3 top-3" />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-0.5 no-scrollbar">
          {["Semua", "High Alert", "Alert", "Normal"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1 rounded-full font-bold text-[10.5px] transition-all whitespace-nowrap ${
                filterLevel === lvl
                  ? "bg-[#003396] text-white shadow-xs"
                  : "bg-[#f8f9fc] text-[#424752] border border-[#E2E8F0]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-3">
        {filtered.map((sig) => (
          <div
            key={sig.id}
            className="bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-2.5 hover:border-[#003396]/30 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-[#003396]">{sig.disease}</h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Terverifikasi
                  </span>
                </div>
                <p className="text-[11px] text-[#737784] font-medium mt-0.5">
                  Patogen: <em>{sig.pathogen}</em>
                </p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase whitespace-nowrap ${
                  sig.threatLevel === "High Alert"
                    ? "bg-[#FFDAD6] text-[#93000A] border border-[#BA1A1A]/30"
                    : sig.threatLevel === "Alert"
                    ? "bg-[#FED889] text-[#785D1A] border border-[#C1A74F]/50"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {sig.threatLevel}
              </span>
            </div>

            <p className="text-xs text-[#191c1e] bg-[#f8f9fc] p-3 rounded-2xl border border-[#E2E8F0] leading-relaxed">
              {sig.snippet}
            </p>

            <div className="flex items-center justify-between text-[11px] text-[#737784] pt-1 border-t border-[#E2E8F0]">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#003396]" />
                {sig.location}, {sig.country}
              </span>
              <span>{sig.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
