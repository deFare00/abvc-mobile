"use client";

import React from "react";
import { PublicHealthEvent } from "@/types/publicHealthEvent";
import { ExternalLink, Calendar, MapPin, AlertCircle } from "lucide-react";

interface PheEventTableProps {
  events: PublicHealthEvent[];
  selectedEvent: PublicHealthEvent | null;
  onSelectEvent: (event: PublicHealthEvent) => void;
  onOpenResource: (event: PublicHealthEvent) => void;
}

export default function PheEventTable({
  events,
  selectedEvent,
  onSelectEvent,
  onOpenResource,
}: PheEventTableProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 text-center shadow-xs">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-700">No Events Found</p>
        <p className="text-[11px] text-slate-500 mt-1">
          No public health events match your current filter criteria. Try expanding the date range or selecting ASEAN region.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Sub-header with item count */}
      <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-700 tracking-wide">
          OFFICIAL EVENT REGISTRY
        </span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 border border-blue-200/60">
          {events.length} Event{events.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Responsive Table matching reference screenshot columns */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-2.5 px-3 w-28">Country</th>
              <th className="py-2.5 px-3 min-w-[180px]">Title</th>
              <th className="py-2.5 px-3 w-24">Date</th>
              <th className="py-2.5 px-3 w-28 text-center">Link Resource</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {events.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;

              return (
                <tr
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? "bg-blue-50/80 font-medium text-blue-900"
                      : "hover:bg-slate-50/80 text-slate-700"
                  }`}
                >
                  {/* Country Column */}
                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                      {evt.country}
                    </div>
                    {evt.city && (
                      <span className="text-[10px] text-slate-500 pl-3 block truncate max-w-[100px]">
                        {evt.city}
                      </span>
                    )}
                  </td>

                  {/* Title Column */}
                  <td className="py-3 px-3 align-top">
                    <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug">
                      {evt.title}
                    </p>
                    {evt.disease && (
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                          {evt.disease}
                        </span>
                        {evt.severity && (
                          <span
                            className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              evt.severity === "CRITICAL"
                                ? "bg-red-100 text-red-700"
                                : evt.severity === "HIGH"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {evt.severity}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Date Column */}
                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <div className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      {evt.dateFormatted}
                    </div>
                  </td>

                  {/* Link Resource Column ("Click Here" exactly as in screenshot) */}
                  <td className="py-3 px-3 align-middle text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenResource(evt);
                      }}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200/80 hover:border-blue-600 rounded-md transition-all active:scale-95 shadow-2xs"
                    >
                      <span>Click Here</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Tip */}
      <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center justify-between">
        <span>💡 Tap a row to pinpoint on the map</span>
        <span className="text-slate-400">Scroll horizontally for more</span>
      </div>
    </div>
  );
}
