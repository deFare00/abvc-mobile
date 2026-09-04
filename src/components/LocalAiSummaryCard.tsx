"use client";

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface LocalAiSummaryCardProps {
  aiSummary?: {
    cached?: boolean;
    provider?: string;
    text?: string;
  } | null;
  isLoading?: boolean;
}

export default function LocalAiSummaryCard({
  aiSummary,
  isLoading = false,
}: LocalAiSummaryCardProps) {
  const summaryText =
    aiSummary?.text ||
    "Terdapat 12 peringatan aktif. Prioritas saat ini adalah Measles di Singapore dengan 802150 kasus dan status AWAS. Verifikasi sumber dan koordinasikan respons epidemiologi setempat.";

  return (
    <div className="bg-[#f0f6ff]/80 hover:bg-[#ebf3ff] transition-all rounded-3xl p-4 sm:p-5 border border-[#bfdbfe]/80 shadow-xs">
      {/* Header with Sparkles Icon & Title */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-[#003396]/10 flex items-center justify-center text-[#003396] flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#003396]" />
        </div>
        <h3 className="text-[11px] font-black text-[#003396] tracking-wider uppercase">
          LOCAL AI SUMMARY
        </h3>
        {isLoading && (
          <Loader2 className="w-3 h-3 animate-spin text-[#003396] ml-auto" />
        )}
      </div>

      {/* Summary Narrative Content */}
      <p className="text-xs sm:text-[12.5px] font-medium text-[#191c1e] leading-relaxed pl-0.5">
        {summaryText}
      </p>

      {/* Snapshot / Local Engine Caption */}
      <p className="text-[9px] font-bold text-[#737784]/80 uppercase tracking-wider mt-2.5 pl-0.5">
        NO PAID API CALLS • UPDATED ALONG WITH SNAPSHOT
      </p>
    </div>
  );
}
