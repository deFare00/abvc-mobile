"use client";

import React from "react";
import { PublicHealthEvent } from "@/types/publicHealthEvent";
import {
  X,
  ExternalLink,
  Calendar,
  MapPin,
  Building2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Activity,
  Users,
} from "lucide-react";

interface PheResourceModalProps {
  event: PublicHealthEvent | null;
  onClose: () => void;
}

export default function PheResourceModal({
  event,
  onClose,
}: PheResourceModalProps) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300">
                Official Health Bulletin
              </span>
              <h3 className="text-sm font-bold text-white leading-tight">
                Event Dossier
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Title and Country */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {event.country}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {event.dateFormatted}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {event.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {event.location}
            </p>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">
                Disease
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
                {event.disease || "Unspecified"}
              </span>
            </div>
            <div className="text-center border-x border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">
                Reported Cases
              </span>
              <span className="text-xs font-bold text-blue-700 block mt-0.5">
                {event.cases !== undefined ? event.cases.toLocaleString() : "N/A"}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">
                Severity
              </span>
              <span
                className={`text-xs font-bold block mt-0.5 ${
                  event.severity === "CRITICAL"
                    ? "text-red-600"
                    : event.severity === "HIGH"
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {event.severity || "MODERATE"}
              </span>
            </div>
          </div>

          {/* Summary / Description */}
          {event.summary && (
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-blue-900 block mb-1">
                Epidemiological Summary
              </span>
              {event.summary}
            </div>
          )}

          {/* Official Source & Authority */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Reporting Institution:</span>
            </div>
            <p className="text-xs font-bold text-slate-900 pl-6">
              {event.sourceAgency || "National Ministry of Health / ASEAN Health Desk"}
            </p>

            <div className="pt-1 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 block">Resource URI:</span>
              <span className="text-xs text-blue-600 underline font-mono break-all line-clamp-1">
                {event.sourceUrl || "https://surveillance.asean.org/bulletins/phe-report"}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors text-center"
          >
            Close
          </button>
          <a
            href={event.sourceUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Open Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
