"use client";

import React from "react";
import Image from "next/image";
import {
  Radio,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  LogIn,
} from "lucide-react";

import ModuleFooterNav from "@/components/ModuleFooterNav";

interface PortalHomeViewProps {
  isLoggedIn: boolean;
  onSelectModule: (module: "ebs" | "ibs" | "analysis") => void;
  onGoToLogin: () => void;
}

export default function PortalHomeView({
  isLoggedIn,
  onSelectModule,
  onGoToLogin,
}: PortalHomeViewProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-[#f8f9fc] text-[#191c1e]">
      {/* ========================================================= */}
      {/* 1. FIXED HEADER                                           */}
      {/* ========================================================= */}
      <header className="flex-shrink-0 z-40 bg-gradient-to-r from-[#003396] via-[#003c87] to-[#0052b4] text-white shadow-md border-b-2 border-[#C1A74F]/40 select-none pt-[env(safe-area-inset-top,0px)]">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          {/* Left: Official Emblem & Portal Title */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-full bg-white p-0.5 shadow-sm border border-[#C1A74F]/70 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/mobile/assets/images/icon_abvc.jpg"
                alt="Logo ABVC"
                width={34}
                height={34}
                className="rounded-full object-contain"
                priority
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-black tracking-tight leading-none text-white">
                ABVC Regional Portal
              </span>
              <span className="text-[9.5px] font-bold text-[#b6ccff] tracking-wider uppercase leading-tight mt-0.5">
                Surveillance Centre
              </span>
            </div>
          </div>

          {/* Right: Status Pill & Auth Action Button */}
          <div className="flex items-center gap-2">
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-extrabold text-[#fed889]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online</span>
            </div>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => onSelectModule("ebs")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fed889] hover:bg-[#ffe3aa] text-[#755a17] text-xs font-black shadow-sm transition-all active:scale-95 border border-white/40"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#755a17]" />
                <span>Officer Session</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoToLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/30 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-[#fed889]" />
                <span>Officer Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN BODY (NON-SCROLLABLE, FIT VIEWPORT)               */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col justify-center px-4 py-3 sm:py-4 space-y-3.5 overflow-hidden">
        
        {/* HERO CARD: TITLE & TEXT ONLY */}
        <div className="relative bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm overflow-hidden">
          {/* Subtle Ambient Gradient Accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#d8e2ff]/50 to-transparent rounded-bl-full pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#fed889]/15 to-transparent rounded-tr-full pointer-events-none -z-0" />

          <div className="relative z-10 space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#003396] tracking-tight leading-snug">
              ABVC Data Crawling
            </h1>
            <p className="text-xs sm:text-[13px] text-[#424752] leading-relaxed font-medium">
              Epidemiological surveillance, outbreak signals, and case trends across ASEAN member states.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3 MODULE CARDS: ICON, TITLE, & BUTTON ONLY               */}
        {/* ========================================================= */}
        <div className="flex flex-col space-y-2.5 sm:space-y-3">
          
          {/* CARD 1: EBS (Event-Based Surveillance) */}
          <div
            onClick={() => onSelectModule("ebs")}
            className="group relative bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-[#003396]/15 hover:border-[#003396] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between active:scale-[0.99] overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#003396] to-[#0052b4] text-white flex items-center justify-center shadow-md shadow-[#003396]/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <Radio className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
              <h2 className="text-xs sm:text-sm font-black text-[#003396] group-hover:text-[#002266] transition-colors truncate">
                EBS (Event-Based Surveillance)
              </h2>
            </div>

            <button
              type="button"
              className="flex-shrink-0 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-[#003396] to-[#0052b4] group-hover:from-[#002266] group-hover:to-[#003c87] text-white font-extrabold text-[11px] sm:text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-sm transition-all border border-[#C1A74F]/40"
            >
              <span>Access</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* CARD 2: IBS (Indicator-Based Surveillance) */}
          <div
            onClick={() => onSelectModule("ibs")}
            className="group relative bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-teal-600/15 hover:border-teal-600 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between active:scale-[0.99] overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-xs sm:text-sm font-black text-teal-900 group-hover:text-teal-950 transition-colors truncate">
                IBS (Indicator-Based Surveillance)
              </h2>
            </div>

            <button
              type="button"
              className="flex-shrink-0 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 group-hover:from-teal-700 group-hover:to-emerald-700 text-white font-extrabold text-[11px] sm:text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Access</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* CARD 3: Analysis */}
          <div
            onClick={() => onSelectModule("analysis")}
            className="group relative bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-indigo-600/15 hover:border-indigo-600 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between active:scale-[0.99] overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-xs sm:text-sm font-black text-indigo-950 group-hover:text-indigo-900 transition-colors truncate">
                Analysis
              </h2>
            </div>

            <button
              type="button"
              className="flex-shrink-0 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:from-indigo-700 group-hover:to-purple-700 text-white font-extrabold text-[11px] sm:text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Access</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FIXED BOTTOM NAVIGATION FOOTER                         */}
      {/* ========================================================= */}
      <ModuleFooterNav onTabChange={(tab) => onSelectModule(tab)} />
    </div>
  );
}
