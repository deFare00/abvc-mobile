"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, LogOut, ShieldCheck, User, Bell, Globe } from "lucide-react";
import { UserProfile } from "@/types/surveillance";

interface HeaderNavProps {
  user: UserProfile;
  onLogout: () => void;
  activeNotificationsCount?: number;
}

export default function HeaderNav({
  user,
  onLogout,
  activeNotificationsCount = 3,
}: HeaderNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lang, setLang] = useState<"ID" | "EN">("ID");

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#003396] via-[#003c87] to-[#0052b4] text-white shadow-md border-b-2 border-[#C1A74F]/40 select-none">
      <div className="w-full px-4 py-2.5 flex items-center justify-between">
        
        {/* Left: Branding & Emblem */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-full bg-white p-0.5 shadow-sm border border-[#C1A74F]/60 flex-shrink-0 flex items-center justify-center">
            <Image
              src="/assets/images/icon_abvc.jpg"
              alt="Logo ABVC"
              width={34}
              height={34}
              className="rounded-full object-contain"
              priority
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-black tracking-tight leading-none text-white flex items-center gap-1">
              ABVC Surveillance
            </span>
            <span className="text-[10px] font-semibold text-[#b6ccff] tracking-wider uppercase leading-tight mt-0.5">
              ASEAN Surveillance Centre
            </span>
          </div>
        </div>

        {/* Right: Language switch + User Profile Pill */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "ID" ? "EN" : "ID")}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-bold tracking-wider transition-colors"
            title="Ganti Bahasa"
          >
            <Globe className="w-3 h-3 text-[#fed889]" />
            <span>{lang}</span>
          </button>

          {/* Notification Indicator */}
          <button
            onClick={() => alert(`Terdapat ${activeNotificationsCount} peringatan surveilans aktif di kawasan regional ASEAN.`)}
            className="relative p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Notifikasi Sinyal Ancaman"
            aria-label="Pemberitahuan"
          >
            <Bell className="w-4 h-4 text-[#fed889]" />
            {activeNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E60012] text-[9px] font-extrabold flex items-center justify-center text-white border border-white">
                {activeNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 transition-all focus:outline-none"
              aria-label="Menu Pengguna"
            >
              <div className="w-7 h-7 rounded-full bg-[#fed889] text-[#755a17] font-bold text-xs flex items-center justify-center overflow-hidden border border-white shadow-sm">
                <Image
                  src="/assets/images/icon_abvc.jpg"
                  alt="User Avatar"
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#003396] truncate">{user.name}</p>
                  <p className="text-[10px] font-semibold text-[#737784] uppercase tracking-wider">{user.role}</p>
                  <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    ID: {user.surveillanceId}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      alert(`Profil Petugas: ${user.name}\nUnit: ${user.institution}\nWilayah: ${user.assignedRegion}`);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#424752] hover:bg-[#f8f9fc] hover:text-[#003396] rounded-xl transition-colors text-left"
                  >
                    <User className="w-3.5 h-3.5 text-[#003396]" />
                    <span>Profil &amp; Otorisasi</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#E60012] hover:bg-red-50 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
