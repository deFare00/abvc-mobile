"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Crosshair,
  Search,
  FileQuestion,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronDown,
  Check,
} from "lucide-react";
import { fetchDashboardSummary } from "@/services/dashboardService";

export interface OutbreakLocationItem {
  id: string;
  location: string;
  country: string;
  disease: string;
  cases: number;
  deaths: number;
  confidence: number;
  status: "CRITICAL" | "HIGH ALERT" | "NORMAL" | "WARNING" | string;
}

function formatDiseaseName(rawName: string): string {
  if (!rawName) return "Unspecified";
  const lower = rawName.toLowerCase();
  if (lower.includes("dengue") || lower.includes("dbd")) {
    return "Dengue Fever";
  }
  if (lower.includes("tuberculosis") || lower.includes("tb")) {
    return "Tuberculosis (TB)";
  }
  if (lower.includes("leptospirosis")) {
    return "Leptospirosis";
  }
  if (lower.includes("measles")) {
    return "Measles";
  }
  if (lower.includes("mpox")) {
    return "Mpox Clade Ib";
  }
  if (lower.includes("avian") || lower.includes("h5n1")) {
    return "Avian Influenza (H5N1)";
  }
  if (lower.includes("cholera")) {
    return "Cholera";
  }
  if (lower.includes("rabies")) {
    return "Rabies";
  }
  if (lower.includes("malaria")) {
    return "Malaria";
  }
  if (lower.includes("zika")) {
    return "Zika";
  }
  if (lower.includes("chikungunya")) {
    return "Chikungunya";
  }
  // Title case fallback, strip any (DBD) or dbd acronyms
  return rawName
    .replace(/\s*\(dbd\)\s*/gi, " ")
    .replace(/\bdbd\b/gi, "")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function OutbreakLocationView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2025, 2024, 2023, 2022]);
  const [matrixData, setMatrixData] = useState<OutbreakLocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Custom Year Dropdown popover states & ref
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch live dashboard summary matrix from API: /api/v1/dashboard/summary?year={{year}}
  useEffect(() => {
    let isMounted = true;
    async function loadMatrix() {
      setIsLoading(true);
      try {
        const data = await fetchDashboardSummary(undefined, selectedYear);
        if (isMounted && data) {
          if (data.filters?.available_years && data.filters.available_years.length > 0) {
            setAvailableYears(data.filters.available_years);
          }

          // Use location_summary from the summary API payload
          const rawLocations = data.location_summary || [];
          if (rawLocations.length > 0) {
            const mapped: OutbreakLocationItem[] = rawLocations.map((item, idx) => {
              const conf = item.confidence
                ? item.confidence > 1
                  ? Math.round(item.confidence)
                  : Math.round(item.confidence * 100)
                : 85;

              let statusText = "NORMAL";
              if (item.severity === "AWAS" || item.severity === "CRITICAL" || item.has_alert) {
                statusText = "CRITICAL";
              } else if (item.severity === "WARNING" || item.severity === "SIAGA") {
                statusText = "WARNING";
              } else if (item.severity) {
                statusText = item.severity.toUpperCase();
              }

              return {
                id: item.event_id || `loc-${idx}`,
                location: item.location || item.country || "Unspecified",
                country: item.country || "ASEAN",
                disease: formatDiseaseName(item.disease),
                cases: item.cases || 0,
                deaths: item.deaths || 0,
                confidence: conf,
                status: statusText,
              };
            });
            setMatrixData(mapped);
          } else if (data.early_warning_system?.alerts && data.early_warning_system.alerts.length > 0) {
            // Fallback to EWS alerts if location_summary is empty
            const mapped: OutbreakLocationItem[] = data.early_warning_system.alerts.map((item, idx) => ({
              id: item.event_id || `ews-loc-${idx}`,
              location: item.location || item.country || "Unspecified",
              country: item.country || "ASEAN",
              disease: formatDiseaseName(item.disease),
              cases: item.cases || 0,
              deaths: item.deaths || 0,
              confidence: item.confidence
                ? item.confidence > 1
                  ? Math.round(item.confidence)
                  : Math.round(item.confidence * 100)
                : 85,
              status: item.severity === "AWAS" ? "CRITICAL" : item.severity || "CRITICAL",
            }));
            setMatrixData(mapped);
          } else {
            setMatrixData([]);
          }
        }
      } catch (err) {
        console.error("Failed to load outbreak location matrix:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMatrix();
    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCountry, selectedYear]);

  // Dynamic countries list
  const countries = useMemo(() => {
    const list = ["All"];
    const standard = [
      "Indonesia",
      "Philippines",
      "Singapore",
      "Malaysia",
      "Thailand",
      "Vietnam",
      "Timor-Leste",
      "Cambodia",
      "Myanmar",
      "Brunei",
    ];
    standard.forEach((c) => {
      if (!list.includes(c)) list.push(c);
    });
    matrixData.forEach((item) => {
      if (item.country && !list.includes(item.country)) {
        list.push(item.country);
      }
    });
    return list;
  }, [matrixData]);

  // Filtered data based on search and country filter
  const filteredData = useMemo(() => {
    return matrixData.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        item.location.toLowerCase().includes(query) ||
        item.disease.toLowerCase().includes(query) ||
        item.country.toLowerCase().includes(query);

      const matchCountry =
        selectedCountry === "All" ||
        selectedCountry.toLowerCase() === "all" ||
        item.country.toLowerCase() === selectedCountry.toLowerCase();

      return matchSearch && matchCountry;
    });
  }, [matrixData, searchQuery, selectedCountry]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* 1. HEADER CARD (CLEAN: NO BADGE, NO SUBTITLE, ATTRACTIVE YEAR DROPDOWN) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm flex items-center justify-between gap-3 relative z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#003396]/10 text-[#003396] border border-[#003396]/20 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Crosshair className="w-5 h-5 text-[#003396]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black text-[#003396] tracking-tight uppercase">
              OUTBREAK LOCATION
            </h2>
          </div>
        </div>

        {/* Custom Attractive Year Dropdown Popover */}
        <div ref={yearDropdownRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsYearDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer focus:outline-none ${
              isYearDropdownOpen
                ? "border-[#003396] shadow-md ring-2 ring-[#003396]/15 bg-white"
                : "border-[#E2E8F0] bg-[#f8f9fc] hover:bg-white hover:border-[#003396]/40 shadow-xs"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#003396]" />
            <span className="text-xs font-bold text-[#191c1e]">
              {selectedYear}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#737784] transition-transform duration-200 ${
                isYearDropdownOpen ? "rotate-180 text-[#003396]" : ""
              }`}
            />
          </button>

          {/* Floating Dropdown Menu */}
          {isYearDropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-36 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="max-h-56 overflow-y-auto space-y-0.5 overscroll-contain pr-1 custom-scrollbar">
                {availableYears.map((y) => {
                  const isSelected = String(selectedYear) === String(y);
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setSelectedYear(String(y));
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#003396] text-white font-bold shadow-xs"
                          : "text-[#334155] hover:bg-[#f1f5f9] hover:text-[#003396] font-semibold"
                      }`}
                    >
                      <span>{y}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[2.5] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SEARCH & QUICK FILTER CONTROLS (ENGLISH)               */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-3.5 border border-[#E2E8F0] shadow-sm space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#737784] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location or disease..."
            className="w-full pl-9 pr-3.5 py-2 bg-[#f8f9fc] rounded-2xl border border-[#E2E8F0] text-xs font-semibold text-[#191c1e] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#003396] transition-colors"
          />
        </div>

        {/* Country Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {countries.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap text-[10.5px] cursor-pointer ${
                selectedCountry === c
                  ? "bg-[#003396] text-white shadow-xs"
                  : "bg-[#f8f9fc] text-[#424752] hover:bg-[#eceef0] border border-[#E2E8F0]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TABLE / OUTBREAK SUMMARY BY LOCATION                   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]/70">
          <span className="w-2 h-2 rounded-full bg-[#003396]"></span>
          <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
            OUTBREAK SUMMARY BY LOCATION
          </h3>
        </div>

        {/* Responsive Horizontal Scroll Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8f9fc] border-b border-[#E2E8F0] text-[10px] font-black text-[#737784] uppercase tracking-wider">
                <th className="py-3 px-3.5 whitespace-nowrap">Location</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Disease</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-right">Cases</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-right">Deaths</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">Confidence</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
              {isLoading ? (
                /* Loading State */
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#003396]" />
                      <p className="text-xs font-bold text-[#191c1e]">
                        Loading Outbreak Location Matrix...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                /* Data Rows */
                paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-[#f8f9fc] transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-[#191c1e] whitespace-nowrap">
                      <div>
                        <span>{row.location}</span>
                        {row.country && row.country !== row.location && (
                          <span className="text-[10px] text-[#737784] font-normal ml-1">
                            ({row.country})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-[#424752] whitespace-nowrap">
                      {row.disease}
                    </td>
                    <td className="py-2.5 px-3.5 font-black text-[#003396] text-right font-mono whitespace-nowrap">
                      {row.cases.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3.5 font-black text-[#BA1A1A] text-right font-mono whitespace-nowrap">
                      {row.deaths.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3.5 text-center font-bold text-[#191c1e] whitespace-nowrap">
                      {row.confidence}%
                    </td>
                    <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                      {row.status === "CRITICAL" ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-[#BA1A1A] border border-red-200">
                          CRITICAL
                        </span>
                      ) : row.status === "WARNING" ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                          WARNING
                        </span>
                      ) : row.status === "NORMAL" ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          NORMAL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-[#003396] border border-blue-200">
                          {row.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty State */
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#f8f9fc] border border-[#E2E8F0] flex items-center justify-center text-[#737784] shadow-xs">
                        <FileQuestion className="w-6 h-6 text-[#737784]" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-[#191c1e]">
                          No Outbreak Data Available
                        </p>
                        <p className="text-[11px] text-[#737784] leading-relaxed">
                          No location records match the current filter or search criteria. Try adjusting your query.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count Controls */}
        {!isLoading && filteredData.length > 0 && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#737784]">
            <span className="text-[11px] font-medium">
              Showing{" "}
              <strong className="text-[#191c1e]">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-[#191c1e]">
                {Math.min(currentPage * pageSize, filteredData.length)}
              </strong>{" "}
              of <strong className="text-[#191c1e]">{filteredData.length}</strong> outbreak locations
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] bg-[#f8f9fc] hover:bg-[#eceef0] disabled:opacity-40 disabled:pointer-events-none text-[#191c1e] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <span className="px-2 text-[11px] font-bold text-[#003396]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] bg-[#f8f9fc] hover:bg-[#eceef0] disabled:opacity-40 disabled:pointer-events-none text-[#191c1e] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
