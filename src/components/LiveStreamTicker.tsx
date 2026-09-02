"use client";

import React, { useState, useEffect, useRef } from "react";
import { Radio, Play, Pause, ChevronUp, ChevronDown, ExternalLink, ShieldAlert, Sparkles, Globe } from "lucide-react";
import { ThreatLevel } from "@/types/surveillance";

export interface StreamItem {
  id: string;
  threatLevel: ThreatLevel;
  disease: string;
  country: string;
  location: string;
  source: string;
  timeAgo: string;
  summary: string;
  keywords: string[];
}

const STATIC_STREAM_ITEMS: StreamItem[] = [
  {
    id: "STREAM-001",
    threatLevel: "High Alert",
    disease: "Mpox Clade Ib",
    country: "Indonesia",
    location: "Pelabuhan Internasional Batam",
    source: "Kemenkes RI • Pos Karantina Feri",
    timeAgo: "2 menit lalu",
    summary: "Skrining termal & biometrik mendeteksi 3 suspek bergejala ruam vesikular dari feri rute Singapura.",
    keywords: ["Mpox Clade Ib", "Thermal Scanner", "Batam-SG Route"],
  },
  {
    id: "STREAM-002",
    threatLevel: "Alert",
    disease: "Avian Influenza (H5N1)",
    country: "Vietnam",
    location: "Mekong Delta River Basin",
    source: "WHO Regional Alert • NLP Stream",
    timeAgo: "8 menit lalu",
    summary: "Analisis NLP mendeteksi laporan kematian 450 unggas air; 12 kontak erat peternak dalam observasi.",
    keywords: ["H5N1 Cluster", "NLP Text Mining", "Mekong Basin"],
  },
  {
    id: "STREAM-003",
    threatLevel: "Normal",
    disease: "Dengue DENV-3",
    country: "Malaysia",
    location: "Selangor & Wilayah Persekutuan",
    source: "MOH Malaysia Surveillance",
    timeAgo: "15 menit lalu",
    summary: "Peringatan dini curah hujan ekstrem; indeks densitas jentik Aedes terpantau meningkat 14%.",
    keywords: ["DENV-3", "Aedes Density", "Urban Surveillance"],
  },
  {
    id: "STREAM-004",
    threatLevel: "Alert",
    disease: "Nipah Virus Monitoring",
    country: "Thailand",
    location: "Southern Border Checkpoint",
    source: "ASEAN Bio-Border Network",
    timeAgo: "28 menit lalu",
    summary: "Surveilans rutin sampel non-invasif kelelawar Pteropus; parameter isolasi peternakan aman.",
    keywords: ["Henipavirus", "Pteropus Bats", "Border Buffer"],
  },
  {
    id: "STREAM-005",
    threatLevel: "High Alert",
    disease: "Polio cVDPV2",
    country: "Filipina",
    location: "Mindanao Island",
    source: "Bureau of Disease Prevention",
    timeAgo: "45 menit lalu",
    summary: "Penguatan surveilans AFP (Acute Flaccid Paralysis) dan pengambilan sampel air limbah lingkungan.",
    keywords: ["cVDPV2", "Wastewater Sampling", "AFP Surveillance"],
  },
  {
    id: "STREAM-006",
    threatLevel: "Normal",
    disease: "Leptospirosis Alert",
    country: "Indonesia",
    location: "Pantai Utara Jakarta & Semarang",
    source: "Dinas Kesehatan Provinsi",
    timeAgo: "1 jam lalu",
    summary: "Peringatan dini genangan rob air laut; ketersediaan profilaksis doksisiklin faskes 100% siap.",
    keywords: ["Leptospira", "Tidal Flooding", "Prophylaxis Readiness"],
  },
];

export default function LiveStreamTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [selectedItem, setSelectedItem] = useState<StreamItem | null>(null);

  // Auto-rotation timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  const handleNext = () => {
    if (isAnimating) return;
    setDirection("next");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % STATIC_STREAM_ITEMS.length);
      setIsAnimating(false);
    }, 350);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setDirection("prev");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + STATIC_STREAM_ITEMS.length) % STATIC_STREAM_ITEMS.length);
      setIsAnimating(false);
    }, 350);
  };

  const currentItem = STATIC_STREAM_ITEMS[currentIndex];

  const getThreatBadge = (level: ThreatLevel) => {
    switch (level) {
      case "High Alert":
        return "bg-[#FFDAD6] text-[#93000A] border border-[#BA1A1A]/30";
      case "Alert":
        return "bg-[#FED889] text-[#785D1A] border border-[#C1A74F]/50";
      case "Normal":
      default:
        return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3">
      
      {/* Ticker Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Live Pulsing Dot */}
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E60012] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E60012]"></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#003396]" />
            <h3 className="text-xs sm:text-sm font-extrabold text-[#003396] tracking-tight">
              Live Feed &amp; Data Stream NLP
            </h3>
          </div>
        </div>

        {/* Controls: Pause/Play, Prev, Next, Counter */}
        <div className="flex items-center gap-1.5 text-xs text-[#737784]">
          <span className="text-[10.5px] font-bold text-[#737784] font-mono mr-1">
            {currentIndex + 1}/{STATIC_STREAM_ITEMS.length}
          </span>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1 rounded-lg border border-[#E2E8F0] transition-colors ${
              isPaused ? "bg-[#fed889]/40 text-[#755a17]" : "bg-[#f8f9fc] text-[#003396] hover:bg-[#d8e2ff]"
            }`}
            title={isPaused ? "Lanjutkan Ticker" : "Jeda Ticker"}
            aria-label={isPaused ? "Play ticker" : "Pause ticker"}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="p-1 rounded-lg bg-[#f8f9fc] hover:bg-[#d8e2ff] text-[#003396] border border-[#E2E8F0] transition-colors"
            title="Sinyal Sebelumnya"
            aria-label="Previous ticker item"
          >
            <ChevronUp className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="p-1 rounded-lg bg-[#f8f9fc] hover:bg-[#d8e2ff] text-[#003396] border border-[#E2E8F0] transition-colors"
            title="Sinyal Selanjutnya"
            aria-label="Next ticker item"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Animated Ticker Window */}
      <div
        className="relative overflow-hidden min-h-[110px] bg-gradient-to-br from-[#f8f9fc] via-white to-[#f2f4f6] rounded-2xl p-3.5 border border-[#E2E8F0] shadow-inner cursor-pointer group hover:border-[#003396]/40 transition-all"
        onClick={() => setSelectedItem(currentItem)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Animated Item with Slide-In & Fade-Out */}
        <div
          className={`space-y-2 transition-all duration-300 ease-in-out transform ${
            isAnimating
              ? direction === "next"
                ? "-translate-y-4 opacity-0 scale-98"
                : "translate-y-4 opacity-0 scale-98"
              : "translate-y-0 opacity-100 scale-100"
          }`}
        >
          {/* Top Line: Disease Name, Threat Badge, Location */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-xs sm:text-sm text-[#003396]">
                {currentItem.disease}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase ${getThreatBadge(currentItem.threatLevel)}`}>
                {currentItem.threatLevel}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#737784] whitespace-nowrap">
              {currentItem.timeAgo}
            </span>
          </div>

          {/* Location & Source Line */}
          <div className="flex items-center gap-1.5 text-[10.5px] text-[#737784]">
            <Globe className="w-3.5 h-3.5 text-[#003396] flex-shrink-0" />
            <span className="font-semibold text-slate-800">{currentItem.location} ({currentItem.country})</span>
            <span>•</span>
            <span className="truncate">{currentItem.source}</span>
          </div>

          {/* Summary Text with Marquee/Ticker feel */}
          <p className="text-xs text-[#191c1e] leading-relaxed line-clamp-2">
            {currentItem.summary}
          </p>

          {/* Keywords / NLP Tags */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            {currentItem.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-white border border-[#E2E8F0] rounded-md text-[9.5px] font-bold text-[#003396]"
              >
                #{kw}
              </span>
            ))}
            <span className="text-[9.5px] text-[#003396] font-bold ml-auto flex items-center gap-0.5 group-hover:underline">
              <span>Detail</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Detail Pop-up Modal when a ticker item is clicked */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#003396]" />
                <h4 className="font-extrabold text-sm text-[#003396]">
                  Detail Sinyal Live Stream
                </h4>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-[#003396]">{selectedItem.disease}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getThreatBadge(selectedItem.threatLevel)}`}>
                  {selectedItem.threatLevel}
                </span>
              </div>

              <div className="p-3 bg-[#f8f9fc] rounded-2xl border border-[#E2E8F0] space-y-1.5">
                <div className="flex justify-between text-[#737784]">
                  <span>Lokasi:</span>
                  <span className="font-bold text-[#191c1e]">{selectedItem.location}, {selectedItem.country}</span>
                </div>
                <div className="flex justify-between text-[#737784]">
                  <span>Sumber Data:</span>
                  <span className="font-bold text-[#003396]">{selectedItem.source}</span>
                </div>
                <div className="flex justify-between text-[#737784]">
                  <span>Waktu Deteksi:</span>
                  <span className="font-bold text-[#191c1e]">{selectedItem.timeAgo}</span>
                </div>
              </div>

              <p className="text-xs text-[#191c1e] leading-relaxed p-1">
                {selectedItem.summary}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedItem.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-[#d8e2ff]/50 text-[#003396] font-bold text-[10px] rounded-full border border-[#aec6ff]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="w-full mt-2 py-2.5 bg-[#003396] text-white font-bold text-xs rounded-full shadow hover:bg-[#002266] transition-all"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
