"use client";

import React from "react";
import { X, HelpCircle, ShieldCheck, MapPin, Smartphone, PhoneCall, KeyRound, Globe, Biohazard } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E2E8F0] max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#003396] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#C1A74F]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#001A42] rounded-lg border border-[#C1A74F]/40">
              <Biohazard className="w-5 h-5 text-[#C1A74F]" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Panduan Pengguna &amp; SOP</h2>
              <p className="text-xs text-[#b6ccff]">ASEAN Biological Threats Surveillance Centre</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Tutup petunjuk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-sm text-[#424752] divide-y divide-[#E2E8F0]">
          {/* Section 1: Cara Masuk Portal */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#003396] font-bold">
              <KeyRound className="w-4 h-4 text-[#C1A74F]" />
              <h3>1. Otorisasi Akses Petugas Surveilans</h3>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#191c1e] leading-relaxed">
              <li>
                Gunakan <strong>Username / Surveillance ID</strong> yang terdaftar pada sistem ABVC Regional Registry.
              </li>
              <li>
                Masukkan <strong>Kata Sandi</strong> terenkripsi Anda.
              </li>
              <li>
                Ketikkan 5 karakter <strong>Kode Keamanan (Captcha)</strong> yang tertera pada kotak verifikasi.
              </li>
              <li>
                Tekan tombol <strong>Masuk Portal</strong> untuk mengakses modul pelaporan dan deteksi patogen.
              </li>
            </ul>
          </div>

          {/* Section 2: Standar Keamanan & Biosecurity */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center gap-2 text-[#003396] font-bold">
              <Globe className="w-4 h-4 text-[#0052b4]" />
              <h3>2. Protokol Geofencing Pos Lintas Batas</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#f8f9fc] p-2.5 rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center gap-1.5 font-semibold text-[#003396] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0052b4]" />
                  <span>GPS Border Pos</span>
                </div>
                <p className="text-[11px] text-[#737784]">
                  Wajib aktif untuk verifikasi titik karantina pelabuhan, bandara, &amp; lab BSL-3/4.
                </p>
              </div>
              <div className="bg-[#f8f9fc] p-2.5 rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center gap-1.5 font-semibold text-[#003396] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Enkripsi E2E</span>
                </div>
                <p className="text-[11px] text-[#737784]">
                  Transmisi data sampel biologis dijamin dengan standar keamanan tingkat regional.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Akun Demo / Uji Coba */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center gap-2 text-[#755a17] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#C1A74F]" />
              <h3>3. Kredensial Uji Coba (Demo Mode)</h3>
            </div>
            <div className="bg-[#fed889]/25 border border-[#C1A74F]/50 p-3 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-[#785d1a]">Kredensial Pengujian Cepat:</p>
              <p className="text-[#191c1e]">
                Surveillance ID: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#003396]">officer.asean</code> atau <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#003396]">admin</code>
              </p>
              <p className="text-[#191c1e]">
                Password: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#003396]">abvc2026</code>
              </p>
            </div>
          </div>

          {/* Section 4: Kontak Pusat Komando ABVC */}
          <div className="pt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-[#003396] font-bold">
              <PhoneCall className="w-4 h-4 text-[#0052b4]" />
              <h3>Pusat Komando &amp; Helpdesk ABVC</h3>
            </div>
            <p className="text-xs text-[#737784]">
              Jika terdapat kegawatdaruratan biosafety atau kendala akses sistem, hubungi Command Center:
            </p>
            <p className="text-xs font-semibold text-[#003396]">
              🌐 surveillance@asean-abvc.org | 📞 Regional Hotline: +62 21-SURVEILLANCE
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="bg-[#f8f9fc] px-5 py-3 border-t border-[#E2E8F0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#003396] hover:bg-[#002b66] text-white font-semibold text-xs rounded-full shadow-sm transition-all"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
