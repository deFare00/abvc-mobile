"use client";

import React from "react";
import { History, CheckCircle2, ShieldCheck, Clock, FileCheck } from "lucide-react";

export default function HistoryView() {
  const auditLogs = [
    {
      id: "LOG-902-1",
      action: "Field Officer Access Authorization",
      user: "Dr. Hendra Wijaya (Super Admin)",
      timestamp: "Today, 09:41 UTC+7",
      status: "Success",
      detail: "Mobile login session verified via central post geofencing.",
    },
    {
      id: "LOG-902-2",
      action: "Multilingual NLP Extraction",
      user: "AI Model ABVC-NLP-v4",
      timestamp: "Today, 09:30 UTC+7",
      status: "Sukses",
      detail: "Processed 128 regional online news articles in Vietnamese & Malay.",
    },
    {
      id: "LOG-902-3",
      action: "Mpox Clade Ib Signal Update",
      user: "Surveillance Desk Batam",
      timestamp: "Today, 08:15 UTC+7",
      status: "Verified",
      detail: "Clinical isolation data validated at ferry port quarantine post.",
    },
    {
      id: "LOG-901-4",
      action: "WHO Regional Office Data Sync",
      user: "System Automated Sync",
      timestamp: "Yesterday, 23:59 UTC+7",
      status: "Sukses",
      detail: "Cross-border epidemiological data exchange with ASEAN member states.",
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
            <h2 className="text-base font-extrabold text-[#003396]">History &amp; Audit Logs</h2>
            <p className="text-[11px] text-[#737784]">Surveillance Transactions &amp; Synchronization Records</p>
          </div>
        </div>
        <p className="text-xs text-[#424752] leading-relaxed pt-1">
          All detection, AI NLP extraction, and pathogen verification activities are recorded permanently for data integrity.
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
