"use client";

import React, { useEffect, useState } from "react";
import { Clock, BrainCircuit, Activity, Layers, MapPin, History, ShieldAlert, ArrowRight, Sparkles, Filter, CheckCircle2, ChevronRight } from "lucide-react";
import { OutbreakSignal, UserProfile } from "@/types/surveillance";
import { NavTab } from "@/components/FooterNav";
import LiveStreamTicker from "@/components/LiveStreamTicker";

interface HomeViewProps {
  user: UserProfile;
  signals: OutbreakSignal[];
  onOpenNlpModal: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export default function HomeView({
  user,
  signals,
  onOpenNlpModal,
  onNavigateTab,
}: HomeViewProps) {
  // Live Clock
  const [timeString, setTimeString] = useState("09.41.28 WIB");
  const [dateString, setDateString] = useState("Rabu, 2 September 2026");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTimeString(`${hours}.${minutes}.${seconds} WIB`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      setDateString(now.toLocaleDateString("id-ID", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Country Filter for Live Signals
  const [selectedCountry, setSelectedCountry] = useState<string>("Semua");
  const countries = ["Semua", "Indonesia", "Vietnam", "Malaysia", "Thailand", "Filipina"];

  const filteredSignals = selectedCountry === "Semua"
    ? signals
    : signals.filter((s) => s.country.toLowerCase() === selectedCountry.toLowerCase());

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      
      {/* 1. Main Welcome Hero Card (Matching Reference Layout) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm space-y-4">
        
        {/* Welcome Text */}
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-[#737784] uppercase">
            SELAMAT DATANG
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#003396] tracking-tight leading-tight">
            {user.role}
          </h2>
          <p className="text-[11px] font-bold text-[#737784] uppercase tracking-wider">
            {user.name} • {user.institution}
          </p>
        </div>

        {/* 2. Realtime Time Widget */}
        <div className="bg-[#f8f9fc] rounded-2xl p-3.5 border border-[#E2E8F0] flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#003396] shadow-xs">
              <Clock className="w-5 h-5 text-[#003396]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#737784] uppercase tracking-wider">
                WAKTU SISTEM
              </p>
              <p className="text-xs font-bold text-[#191c1e]">{dateString}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm sm:text-base font-black text-[#003396] tracking-tight font-mono">
              {timeString}
            </p>
            <p className="text-[10px] font-extrabold text-emerald-600 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </p>
          </div>
        </div>

        {/* 3. Primary Quick Action Button */}
        <button
          type="button"
          onClick={onOpenNlpModal}
          className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#003396] via-[#0052b4] to-[#003396] hover:from-[#002266] hover:to-[#003c87] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-[#003396]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-[#C1A74F]/50"
        >
          <BrainCircuit className="w-4 h-4 text-[#fed889]" />
          <span>Deteksi &amp; Analisis Teks NLP (Input Laporan)</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>

        {/* 4. Metric Grid (Matching 1 Big Card + 2 Small Cards from Reference) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          
          {/* Big Highlight Card (Left Column) */}
          <div className="bg-[#f8f9fc] rounded-2xl p-4 border border-[#E2E8F0] flex flex-col justify-between shadow-xs hover:border-[#003396]/30 transition-all">
            <div>
              <span className="text-3xl font-black text-[#003396] tracking-tight block">
                {signals.length} Sinyal
              </span>
              <span className="text-xs font-bold text-[#191c1e] block mt-1">
                Total Sinyal Bulan Ini
              </span>
            </div>
            <p className="text-[10px] text-[#737784] mt-3 leading-relaxed">
              Sinyal ancaman terdeteksi otomatis via AI NLP regional
            </p>
          </div>

          {/* Right Column with 2 Smaller Cards */}
          <div className="space-y-3 flex flex-col justify-between">
            {/* Small Card 1 */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] shadow-xs hover:border-[#003396]/30 transition-all">
              <span className="text-xl font-black text-[#003396] tracking-tight block">
                1,428 Berita
              </span>
              <span className="text-[11px] font-bold text-[#424752] block">
                Total Artikel Dianalisis
              </span>
            </div>

            {/* Small Card 2 */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] shadow-xs hover:border-[#003396]/30 transition-all">
              <span className="text-xl font-black text-emerald-600 tracking-tight block">
                98.4%
              </span>
              <span className="text-[11px] font-bold text-[#424752] block">
                Akurasi AI &amp; NLP Model
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Shortcut Actions Row (Matching Icon Buttons in Reference) */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center justify-between text-center gap-2">
          
          <button
            type="button"
            onClick={() => onNavigateTab("maps")}
            className="flex-1 flex flex-col items-center p-2 rounded-2xl bg-[#f8f9fc] hover:bg-[#d8e2ff]/50 border border-[#E2E8F0] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#003396] group-hover:scale-110 transition-transform shadow-xs">
              <MapPin className="w-5 h-5 text-[#003396]" />
            </div>
            <span className="text-[10.5px] font-bold text-[#191c1e] mt-1.5">Peta Spasial</span>
          </button>

          <button
            type="button"
            onClick={onOpenNlpModal}
            className="flex-1 flex flex-col items-center p-2 rounded-2xl bg-[#f8f9fc] hover:bg-[#d8e2ff]/50 border border-[#E2E8F0] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#003396] group-hover:scale-110 transition-transform shadow-xs">
              <BrainCircuit className="w-5 h-5 text-[#003396]" />
            </div>
            <span className="text-[10.5px] font-bold text-[#191c1e] mt-1.5">Ekstraksi NLP</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("matrix")}
            className="flex-1 flex flex-col items-center p-2 rounded-2xl bg-[#f8f9fc] hover:bg-[#d8e2ff]/50 border border-[#E2E8F0] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#003396] group-hover:scale-110 transition-transform shadow-xs">
              <Layers className="w-5 h-5 text-[#003396]" />
            </div>
            <span className="text-[10.5px] font-bold text-[#191c1e] mt-1.5">Matriks Risiko</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("history")}
            className="flex-1 flex flex-col items-center p-2 rounded-2xl bg-[#f8f9fc] hover:bg-[#d8e2ff]/50 border border-[#E2E8F0] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#003396] group-hover:scale-110 transition-transform shadow-xs">
              <History className="w-5 h-5 text-[#003396]" />
            </div>
            <span className="text-[10.5px] font-bold text-[#191c1e] mt-1.5">Log Sinyal</span>
          </button>
        </div>
      </div>

      {/* 6. Live Outbreak Signals Feed (Recent Extracted Signals) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#003396]" />
            <h3 className="text-xs sm:text-sm font-extrabold text-[#003396]">
              Sinyal Deteksi Dini Terkini
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("signals")}
            className="text-[11px] font-bold text-[#003396] hover:underline flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Country Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {countries.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap text-[11px] ${
                selectedCountry === c
                  ? "bg-[#003396] text-white shadow-xs font-bold"
                  : "bg-[#f8f9fc] text-[#424752] hover:bg-[#eceef0] border border-[#E2E8F0]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Signal Items List */}
        <div className="space-y-2.5">
          {filteredSignals.slice(0, 3).map((sig) => (
            <div
              key={sig.id}
              className="p-3 bg-[#f8f9fc] hover:bg-[#f2f4f6] rounded-2xl border border-[#E2E8F0] space-y-1.5 transition-colors cursor-pointer"
              onClick={() => onNavigateTab("signals")}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-extrabold text-xs text-[#003396] block">
                    {sig.disease}
                  </span>
                  <span className="text-[10px] text-[#737784] font-medium">
                    {sig.location} • {sig.country}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase whitespace-nowrap ${
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
              <p className="text-[11px] text-[#424752] line-clamp-2 leading-relaxed">
                {sig.snippet}
              </p>
              <div className="flex items-center justify-between text-[10px] text-[#737784] pt-1 border-t border-[#E2E8F0]/60">
                <span>Sumber: {sig.source}</span>
                <span>{sig.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Live Feed & Data Stream NLP Ticker (Positioned below Sinyal Deteksi Dini Terkini) */}
      <LiveStreamTicker />
    </div>
  );
}
