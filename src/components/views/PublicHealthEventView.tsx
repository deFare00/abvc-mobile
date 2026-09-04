"use client";

import React, { useState, useMemo } from "react";
import {
  mockPublicHealthEvents,
  DEFAULT_PHE_FILTER,
} from "@/data/publicHealthEventData";
import { PublicHealthEvent, PheFilterState } from "@/types/publicHealthEvent";
import PheFilterBar from "@/components/phe/PheFilterBar";
import PheMapView from "@/components/phe/PheMapView";
import PheEventTable from "@/components/phe/PheEventTable";
import PheResourceModal from "@/components/phe/PheResourceModal";
import {
  Layers,
  Map as MapIcon,
  Table as TableIcon,
  Radio,
  RefreshCw,
} from "lucide-react";

type ViewMode = "split" | "map" | "table";

export default function PublicHealthEventView() {
  const [filter, setFilter] = useState<PheFilterState>(DEFAULT_PHE_FILTER);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [selectedEvent, setSelectedEvent] = useState<PublicHealthEvent | null>(
    mockPublicHealthEvents[0] || null
  );
  const [resourceModalEvent, setResourceModalEvent] =
    useState<PublicHealthEvent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Apply filters based on region and date range
  const filteredEvents = useMemo(() => {
    return mockPublicHealthEvents.filter((event: PublicHealthEvent) => {
      // Region / Country filter
      if (filter.region && filter.region !== "ASEAN" && filter.region !== "all") {
        if (event.country.toLowerCase() !== filter.region.toLowerCase()) {
          return false;
        }
      }

      // Date Range filter (ISO strings compare lexicographically: YYYY-MM-DD)
      if (filter.startDate && event.date < filter.startDate) {
        return false;
      }
      if (filter.endDate && event.date > filter.endDate) {
        return false;
      }

      return true;
    });
  }, [filter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  const handleResetFilter = () => {
    setFilter(DEFAULT_PHE_FILTER);
  };

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-[#003396] tracking-tight">
              PUBLIC HEALTH EVENTS
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
              <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" />
              LIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Epidemiological surveillance &amp; ASEAN outbreak registry
          </p>
        </div>

        <button
          onClick={handleRefresh}
          title="Refresh Events"
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
          />
        </button>
      </div>

      {/* Filter Bar */}
      <PheFilterBar
        filter={filter}
        onFilterChange={setFilter}
        onReset={handleResetFilter}
        resultsCount={filteredEvents.length}
      />

      {/* View Mode Switcher */}
      <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
        <button
          type="button"
          onClick={() => setViewMode("split")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            viewMode === "split"
              ? "bg-white text-blue-700 shadow-xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Split View</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("map")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            viewMode === "map"
              ? "bg-white text-blue-700 shadow-xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Map Only</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("table")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            viewMode === "table"
              ? "bg-white text-blue-700 shadow-xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Event List</span>
        </button>
      </div>

      {/* Dynamic Content based on ViewMode */}
      {viewMode === "split" && (
        <div className="space-y-3">
          {/* Compact Map on top */}
          <PheMapView
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
            onOpenResource={setResourceModalEvent}
            heightClass="h-[230px]"
          />

          {/* Table below */}
          <PheEventTable
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
            onOpenResource={setResourceModalEvent}
          />
        </div>
      )}

      {viewMode === "map" && (
        <div className="space-y-3">
          {/* Expanded Full Map */}
          <PheMapView
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
            onOpenResource={setResourceModalEvent}
            heightClass="h-[460px]"
          />

          {/* Quick Info Bar for Selected Event */}
          {selectedEvent && (
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-blue-600 uppercase">
                  {selectedEvent.country} • {selectedEvent.dateFormatted || selectedEvent.date}
                </span>
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {selectedEvent.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResourceModalEvent(selectedEvent)}
                className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs cursor-pointer"
              >
                Click Here
              </button>
            </div>
          )}
        </div>
      )}

      {viewMode === "table" && (
        <div>
          <PheEventTable
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
            onOpenResource={setResourceModalEvent}
          />
        </div>
      )}

      {/* Official Resource Details Modal */}
      <PheResourceModal
        event={resourceModalEvent}
        onClose={() => setResourceModalEvent(null)}
      />
    </div>
  );
}
