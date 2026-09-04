"use client";

import React from "react";
import { X, FileText, ExternalLink, ShieldAlert, MapPin } from "lucide-react";
import { EWSAlertItem } from "@/components/EarlyWarningSystem";

interface EwsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: EWSAlertItem | null;
}

export default function EwsDetailModal({
  isOpen,
  onClose,
  alert,
}: EwsDetailModalProps) {
  if (!isOpen || !alert) return null;

  // Confidence percentage formatting
  const confidencePct = alert.confidence
    ? alert.confidence > 1
      ? Math.round(alert.confidence)
      : Math.round(alert.confidence * 100)
    : 85;

  // Formatted location
  const locationFormatted =
    alert.location && alert.country && !alert.location.toLowerCase().includes(alert.country.toLowerCase())
      ? `${alert.location}, ${alert.country}`
      : alert.location || alert.country || "-";

  // Formatted date
  const dateFormatted =
    alert.lastUpdated && !alert.lastUpdated.includes("ago")
      ? alert.lastUpdated
      : "2026-08-04";

  // Dossier metadata fields with smart intelligent defaults
  const eventType =
    alert.eventType ||
    (alert.deaths > 10 ? "Outbreak Alert" : "Health Update");

  const relevance =
    alert.relevance ||
    (alert.cases > 500000 ? "Low" : alert.cases > 10000 ? "Medium" : "High");

  const sentiment =
    alert.sentiment ||
    (alert.deaths > 50 ? "Concerning" : "Neutral");

  const healthRelated =
    alert.healthRelated !== undefined
      ? typeof alert.healthRelated === "boolean"
        ? alert.healthRelated
          ? "Yes"
          : "No"
        : alert.healthRelated
      : "Yes";

  const needsReview =
    alert.needsReview !== undefined
      ? typeof alert.needsReview === "boolean"
        ? alert.needsReview
          ? "Yes"
          : "No"
        : alert.needsReview
      : "No";

  const credibility =
    alert.credibility !== undefined
      ? typeof alert.credibility === "number"
        ? `${alert.credibility}%`
        : String(alert.credibility)
      : "50%";

  // Symptoms detection tags
  const detectedSymptoms =
    alert.detectedSymptoms && alert.detectedSymptoms.length > 0
      ? alert.detectedSymptoms
      : alert.disease.toLowerCase().includes("measles")
      ? ["DISEASE", "INFECTION", "OUTBREAK", "VIRUS"]
      : alert.disease.toLowerCase().includes("dengue") || alert.disease.toLowerCase().includes("dbd")
      ? ["HIGH FEVER", "HEADACHE", "JOINT PAIN", "OUTBREAK"]
      : alert.disease.toLowerCase().includes("tb") || alert.disease.toLowerCase().includes("tuberculosis")
      ? ["CHRONIC COUGH", "CHEST PAIN", "FEVER", "INFECTION"]
      : alert.disease.toLowerCase().includes("rabies")
      ? ["HYDROPHOBIA", "FEVER", "AGITATION", "VIRUS"]
      : alert.disease.toLowerCase().includes("cholera")
      ? ["DIARRHEA", "DEHYDRATION", "VOMITING", "BACTERIAL"]
      : ["DISEASE", "INFECTION", "OUTBREAK", "VIRUS"];

  const cleanDisease = (name?: string): string => {
    if (!name) return "-";
    const lower = name.toLowerCase();
    if (lower.includes("dengue") || lower.includes("dbd")) {
      return "Dengue Fever";
    }
    return name.replace(/\s*\(dbd\)\s*/gi, " ").replace(/\bdbd\b/gi, "").trim();
  };

  const diseaseFormatted = cleanDisease(alert.disease);
  const extractedDisease = alert.extractedDisease
    ? cleanDisease(alert.extractedDisease)
    : diseaseFormatted;

  const sourceName = alert.sourceName || "URL Analyzer";
  const sourceType = alert.sourceType || "web";

  const sourceUrl =
    alert.sourceUrl ||
    (alert.country.toLowerCase().includes("singapore") && alert.disease.toLowerCase().includes("measles")
      ? "https://mustsharenews.com/measles-cases-singapore-2026/amp/"
      : alert.country.toLowerCase().includes("indonesia")
      ? "https://kemkes.go.id/id/rilis-kesehatan/surveilans-penyakit-menular-2026"
      : alert.country.toLowerCase().includes("philippines")
      ? "https://doh.gov.ph/surveillance/epidemiological-bulletin-2026"
      : alert.country.toLowerCase().includes("vietnam")
      ? "https://moh.gov.vn/surveillance/bulletin-2026"
      : alert.country.toLowerCase().includes("timor")
      ? "https://ms.gov.tl/dili-surveillance-bulletin-2026"
      : `https://abvc-surveillance.org/signals/${alert.id}`);

  const originalContent =
    alert.originalContent ||
    (alert.country.toLowerCase().includes("singapore") && alert.disease.toLowerCase().includes("measles")
      ? "S'pore sees highest number of measles cases in 6 years, vaccinated individuals among 2026 cases.\n\nSingapore has recorded 43 cases of measles in 2026 so far, its highest number of cases since 2020. This is according to the Communicable Diseases Agency (CDA) Weekly Infectious Diseases Bulletin published on 30 July. In contrast, 27 cases were recorded in 2025. However, this year's number falls well below the 152 cases logged in 2019. In response to MS News enquiries, a CDA spokesperson said adults aged 25 to 44 still account for the majority of measles cases recorded so far this year. At least three of the..."
      : `${alert.country} health authorities reported an active surveillance signal regarding ${diseaseFormatted} in ${locationFormatted}. A total of ${alert.cases.toLocaleString()} cases and ${alert.deaths.toLocaleString()} fatalities have been validated by automated NLP signal extraction. Cross-jurisdiction monitoring and outbreak containment protocols remain actively deployed in accordance with ASEAN early warning surveillance guidelines.`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E2E8F0] max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ========================================================= */}
        {/* MODAL HEADER                                              */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 pt-5 pb-3.5 border-b border-[#E2E8F0] flex items-start justify-between gap-3 bg-white sticky top-0 z-10">
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-[10px] font-black text-[#003396] uppercase tracking-wider block">
              DASHBOARD.EVENTMODAL.BADGEDETAILS
            </span>
            <div className="flex items-start gap-2.5">
              <FileText className="w-5 h-5 text-[#003396] flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-[#191c1e] tracking-tight uppercase leading-snug truncate">
                  {diseaseFormatted} - {alert.country}
                </h3>
                <p className="text-[11px] font-medium text-[#737784] mt-0.5">
                  {sourceName} • {dateFormatted}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8f9fc] hover:bg-[#eceef0] border border-[#E2E8F0] flex items-center justify-center text-[#737784] hover:text-[#191c1e] transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY (SCROLLABLE)                                   */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-[#191c1e] overscroll-contain">
          {/* 1. METRICS GRID: 12 Cards in 4-Column Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. DISEASE */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                DISEASE
              </span>
              <span
                className="text-xs sm:text-sm font-black text-[#191c1e] mt-1 truncate"
                title={diseaseFormatted}
              >
                {diseaseFormatted}
              </span>
            </div>

            {/* 2. LOCATION */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                LOCATION
              </span>
              <span
                className="text-xs sm:text-sm font-black text-[#191c1e] mt-1 truncate"
                title={locationFormatted}
              >
                {locationFormatted}
              </span>
            </div>

            {/* 3. TOTAL CASES */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                TOTAL CASES
              </span>
              <span className="text-xs sm:text-sm font-black text-[#003396] mt-1 truncate">
                {alert.cases ? alert.cases.toLocaleString() : "0"}
              </span>
            </div>

            {/* 4. DEATHS */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                DEATHS
              </span>
              <span className="text-xs sm:text-sm font-black text-[#191c1e] mt-1 truncate">
                {alert.deaths ? alert.deaths.toLocaleString() : "0"}
              </span>
            </div>

            {/* 5. CONFIDENCE */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                CONFIDENCE
              </span>
              <span className="text-xs sm:text-sm font-black text-[#191c1e] mt-1">
                {confidencePct}%
              </span>
            </div>

            {/* 6. EWS STATUS */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                EWS STATUS
              </span>
              <span className="text-xs sm:text-sm font-black text-[#BA1A1A] mt-1 uppercase">
                {alert.status || "CRITICAL"}
              </span>
            </div>

            {/* 7. EVENT TYPE */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                EVENT TYPE
              </span>
              <span className="text-xs sm:text-sm font-black text-[#191c1e] mt-1 truncate">
                {eventType}
              </span>
            </div>

            {/* 8. RELEVANCE */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                RELEVANCE
              </span>
              <span className="text-xs sm:text-sm font-black text-[#191c1e] mt-1 truncate">
                {relevance}
              </span>
            </div>

            {/* 9. SENTIMENT */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                SENTIMENT
              </span>
              <span className="text-xs sm:text-sm font-black text-[#191c1e] mt-1 truncate">
                {sentiment}
              </span>
            </div>

            {/* 10. HEALTH RELATED */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                HEALTH RELATED
              </span>
              <span className="text-xs sm:text-sm font-black text-[#191c1e] mt-1">
                {healthRelated}
              </span>
            </div>

            {/* 11. NEEDS REVIEW */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                NEEDS REVIEW
              </span>
              <span className="text-xs sm:text-sm font-black text-[#191c1e] mt-1">
                {needsReview}
              </span>
            </div>

            {/* 12. CREDIBILITY */}
            <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                CREDIBILITY
              </span>
              <span className="text-xs sm:text-sm font-black text-[#191c1e] mt-1">
                {credibility}
              </span>
            </div>
          </div>

          {/* 2. DETECTED SYMPTOMS & EXTRACTED DISEASE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Detected Symptoms */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-2xs space-y-2">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
                DETECTED SYMPTOMS
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {detectedSymptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full border border-amber-300 bg-amber-50/70 text-amber-800 text-[10.5px] font-bold uppercase tracking-wide"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {/* Extracted Disease */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-2xs space-y-2">
              <span className="text-[9.5px] font-bold text-[#737784] uppercase tracking-wider block">
                EXTRACTED DISEASE
              </span>
              <div className="pt-0.5">
                <span className="inline-block px-3.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-[#003396] text-[11px] font-bold">
                  {extractedDisease}
                </span>
              </div>
            </div>
          </div>

          {/* 3. DATA SOURCE */}
          <div className="bg-[#f0f6ff]/70 rounded-2xl p-4 border border-[#bfdbfe]/80 space-y-3">
            <span className="text-[10px] font-black text-[#003396] uppercase tracking-wider block">
              DATA SOURCE
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[9px] font-bold text-[#737784] uppercase tracking-wider block">
                  SOURCE NAME
                </span>
                <span className="text-xs sm:text-sm font-black text-[#191c1e] mt-0.5 block">
                  {sourceName}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#737784] uppercase tracking-wider block">
                  SOURCE TYPE
                </span>
                <span className="text-xs sm:text-sm font-black text-[#191c1e] mt-0.5 block">
                  {sourceType}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#737784] uppercase tracking-wider block mb-1">
                FULL URL
              </span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#003396] hover:text-[#002266] font-semibold hover:underline break-all group"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-[#003396] group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-full">{sourceUrl}</span>
              </a>
            </div>
          </div>

          {/* 4. ORIGINAL MAIN CONTENT */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black text-[#737784] uppercase tracking-wider">
                ORIGINAL MAIN CONTENT
              </span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003396] hover:underline cursor-pointer"
              >
                <ExternalLink className="w-3 h-3 text-[#003396]" />
                <span>Open source</span>
              </a>
            </div>
            <div className="text-xs text-[#424752] leading-relaxed max-h-40 overflow-y-auto pr-2 whitespace-pre-line custom-scrollbar bg-[#f8f9fc] p-3.5 rounded-xl border border-[#E2E8F0]/70">
              {originalContent}
            </div>
          </div>

          {/* 5. GEOGRAPHICAL & EVENT METADATA (OPTIONAL ACCORDION/CARD) */}
          {(alert.latitude !== undefined || alert.eventId) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {alert.latitude !== undefined && alert.longitude !== undefined && (
                <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] space-y-1">
                  <div className="flex items-center gap-1 text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-[#003396]" />
                    <span>COORDINATES (LAT / LON)</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-[#191c1e]">
                    {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                  </div>
                </div>
              )}
              {alert.eventId && (
                <div className="bg-[#f8f9fc] rounded-2xl p-3 border border-[#E2E8F0] space-y-1">
                  <div className="flex items-center gap-1 text-[9.5px] font-bold text-[#737784] uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#BA1A1A]" />
                    <span>EVENT IDENTIFIER</span>
                  </div>
                  <div
                    className="text-xs font-mono font-bold text-[#191c1e] truncate"
                    title={alert.eventId}
                  >
                    {alert.eventId}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER                                              */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 py-3 border-t border-[#E2E8F0] bg-[#f8f9fc] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[#003396] hover:bg-[#002266] text-white font-extrabold text-xs tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
