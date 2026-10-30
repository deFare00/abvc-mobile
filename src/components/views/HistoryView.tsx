"use client";

import React from "react";
import { History, CheckCircle2, ShieldCheck, Clock, FileCheck } from "lucide-react";

export default function HistoryView() {
  const auditLogs = [
    {
      id: "LOG-902-1",
      action: "Otorisasi Akses Petugas Lapangan",
      user: "Dr. Hendra Wijaya (Super Admin)",
      timestamp: "Hari ini, 09:41 WIB",
      status: "Sukses",
      detail: "Sesi login dari perangkat mobile terverifikasi geofencing pos pusat.",
    },
    {
      id: "LOG-902-2",
      action: "Ekstraksi NLP Multilingual",
      user: "AI Model ABVC-NLP-v4",
      timestamp: "Hari ini, 09:30 WIB",
      status: "Sukses",
      detail: "Pemrosesan 128 artikel berita online regional bahasa Vietnam & Melayu.",
    },
    {
      id: "LOG-902-3",
      action: "Pembaruan Sinyal Mpox Clade Ib",
      user: "Surveillance Desk Batam",
      timestamp: "Hari ini, 08:15 WIB",
      status: "Terverifikasi",
      detail: "Validasi data isolasi klinis pada pos karantina pelabuhan feri.",
    },
    {
      id: "LOG-901-4",
      action: "Sinkronisasi Data WHO Regional Office",
      user: "System Automated Sync",
      timestamp: "Kemarin, 23:59 WIB",
      status: "Sukses",
      detail: "Pertukaran data epidemiologi lintas negara anggota ASEAN.",
    },
  ];

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#003396]/10 text-[#003396] rounded-xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#003396]">Riwayat &amp; Log Audit</h2>
            <p className="text-[11px] text-[#737784]">Catatan Transaksi &amp; Sinkronisasi Surveilans</p>
          </div>
        </div>
        <p className="text-xs text-[#424752] leading-relaxed pt-1">
          Seluruh aktivitas deteksi, ekstraksi AI NLP, dan verifikasi patogen dicatat secara permanen untuk integritas data.
        </p>
      </div>

      {/* Logs List */}
      <div className="space-y-2.5">
        {auditLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#003396]" />
                <h3 className="font-extrabold text-xs text-[#191c1e]">{log.action}</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {log.status}
              </span>
            </div>

            <p className="text-[11px] text-[#424752] bg-[#f8f9fc] p-2.5 rounded-2xl border border-[#E2E8F0] leading-relaxed">
              {log.detail}
            </p>

            <div className="flex items-center justify-between text-[10.5px] text-[#737784] pt-1 border-t border-[#E2E8F0]/60">
              <span className="font-semibold">{log.user}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#003396]" />
                {log.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
