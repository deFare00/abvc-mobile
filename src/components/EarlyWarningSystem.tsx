"use client";

import React, { useState, useMemo } from "react";
import { AlertTriangle, MapPin, Info, Loader2 } from "lucide-react";
import EwsDetailModal from "@/components/EwsDetailModal";
import { EwsAlertApiItem } from "@/types/dashboardApi";

export interface EWSAlertItem {
  id: string;
  disease: string;
  location: string;
  country: string;
  status: "CRITICAL" | "HIGH ALERT" | "WARNING" | string;
  cases: number;
  deaths: number;
  threshold: number;
  confidence?: number;
  lastUpdated?: string;
  eventId?: string;
  latitude?: number;
  longitude?: number;
  eventCount?: number;
  eventType?: string;
  relevance?: string;
  sentiment?: string;
  healthRelated?: boolean | string;
  needsReview?: boolean | string;
  credibility?: number | string;
  detectedSymptoms?: string[];
  extractedDisease?: string;
  sourceName?: string;
  sourceType?: string;
  sourceUrl?: string;
  originalContent?: string;
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
  // Title case fallback, strip any (DBD) or dbd acronyms
  return rawName
    .replace(/\s*\(dbd\)\s*/gi, " ")
    .replace(/\bdbd\b/gi, "")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const DEFAULT_EWS_ITEMS: EWSAlertItem[] = [
  {
    id: "ews-1",
    disease: "Tuberculosis (TB)",
    location: "National Capital Region, Philippines",
    country: "Philippines",
    status: "CRITICAL",
    cases: 1905041,
    deaths: 188,
    threshold: 1,
    confidence: 85,
    lastUpdated: "2026-08-04",
    eventType: "Outbreak Alert",
    relevance: "High",
    sentiment: "Concerning",
    healthRelated: "Yes",
    needsReview: "No",
    credibility: "85%",
    detectedSymptoms: ["CHRONIC COUGH", "CHEST PAIN", "FEVER", "INFECTION"],
    extractedDisease: "Tuberculosis",
    sourceName: "Philippine Health Surveillance",
    sourceType: "web",
    sourceUrl: "https://doh.gov.ph/surveillance/tuberculosis-cases-2026",
    originalContent:
      "Philippine Department of Health (DOH) epidemiological bureau reported escalating tuberculosis alerts across NCR with 1.9M cumulative detections under intensive monitoring and cross-cluster response.",
  },
  {
    id: "ews-2",
    disease: "Measles",
    location: "Singapore, Singapore",
    country: "Singapore",
    status: "CRITICAL",
    cases: 802150,
    deaths: 0,
    threshold: 1,
    confidence: 85,
    lastUpdated: "2026-08-04",
    eventType: "Health Update",
    relevance: "Low",
    sentiment: "Neutral",
    healthRelated: "Yes",
    needsReview: "No",
    credibility: "50%",
    detectedSymptoms: ["DISEASE", "INFECTION", "OUTBREAK", "VIRUS"],
    extractedDisease: "Measles",
    sourceName: "URL Analyzer",
    sourceType: "web",
    sourceUrl: "https://mustsharenews.com/measles-cases-singapore-2026/amp/",
    originalContent:
      "S'pore sees highest number of measles cases in 6 years, vaccinated individuals among 2026 cases.\n\nSingapore has recorded 43 cases of measles in 2026 so far, its highest number of cases since 2020. This is according to the Communicable Diseases Agency (CDA) Weekly Infectious Diseases Bulletin published on 30 July. In contrast, 27 cases were recorded in 2025. However, this year's number falls well below the 152 cases logged in 2019. In response to MS News enquiries, a CDA spokesperson said adults aged 25 to 44 still account for the majority of measles cases recorded so far this year. At least three of the...",
  },
  {
    id: "ews-3",
    disease: "Dengue Fever",
    location: "National Capital Region",
    country: "Philippines",
    status: "CRITICAL",
    cases: 174077,
    deaths: 0,
    threshold: 1,
    confidence: 43,
    lastUpdated: "2026-08-04",
    eventType: "Health Update",
    relevance: "Medium",
    sentiment: "Neutral",
    healthRelated: "Yes",
    needsReview: "No",
    credibility: "50%",
    detectedSymptoms: ["HIGH FEVER", "HEADACHE", "JOINT PAIN", "OUTBREAK"],
    extractedDisease: "Dengue Fever",
    sourceName: "URL Analyzer",
    sourceType: "web",
    sourceUrl: "https://doh.gov.ph/dengue-surveillance-ncr-2026",
    originalContent:
      "Dengue surveillance data indicates elevated transmission vectors in NCR metropolitan sectors. Community mosquito mitigation and clinical fever monitoring protocols remain actively deployed.",
  },
  {
    id: "ews-4",
    disease: "Dengue Fever",
    location: "Kupang, Indonesia",
    country: "Indonesia",
    status: "CRITICAL",
    cases: 39697,
    deaths: 105,
    threshold: 1,
    confidence: 85,
    lastUpdated: "2026-08-04",
    eventType: "Outbreak Alert",
    relevance: "High",
    sentiment: "Critical",
    healthRelated: "Yes",
    needsReview: "No",
    credibility: "85%",
    detectedSymptoms: ["HIGH FEVER", "PLATELET DROP", "BLEEDING", "OUTBREAK"],
    extractedDisease: "Dengue Fever",
    sourceName: "Kemenkes RI Portal",
    sourceType: "web",
    sourceUrl: "https://kemkes.go.id/surveilans-dbd-kupang-2026",
    originalContent:
      "Kementerian Kesehatan RI merilis peringatan dini kenaikan kasus Dengue Fever di wilayah Kupang dan NTT, menginstruksikan percepatan fogging fokus dan kesiapan RSUD setempat.",
  },
  {
    id: "ews-5",
    disease: "Tuberculosis (TB)",
    location: "Hanoi, Vietnam",
    country: "Vietnam",
    status: "CRITICAL",
    cases: 3000,
    deaths: 0,
    threshold: 1,
    confidence: 57,
    lastUpdated: "2026-08-04",
    eventType: "Health Update",
    relevance: "Low",
    sentiment: "Neutral",
    healthRelated: "Yes",
    needsReview: "No",
    credibility: "60%",
    detectedSymptoms: ["COUGH", "FATIGUE", "FEVER", "BACTERIAL"],
    extractedDisease: "Tuberculosis",
    sourceName: "Vietnam MoH Center",
    sourceType: "web",
    sourceUrl: "https://moh.gov.vn/surveillance/tb-hanoi-2026",
    originalContent:
      "Vietnam Ministry of Health epidemiological unit reports ongoing community screening initiatives in Hanoi municipal districts with steady case resolution rates.",
  },
];

interface EarlyWarningSystemProps {
  alerts?: EwsAlertApiItem[];
  isLoading?: boolean;
  selectedCountryFilter?: string;
  onCountrySelect?: (country: string) => void;
}

export default function EarlyWarningSystem({
  alerts,
  isLoading = false,
  selectedCountryFilter = "All",
  onCountrySelect,
}: EarlyWarningSystemProps) {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedAlert, setSelectedAlert] = useState<EWSAlertItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Synchronize internal activeTab when parent selectedCountryFilter changes
  React.useEffect(() => {
    if (selectedCountryFilter) {
      if (selectedCountryFilter === "All ASEAN Countries" || selectedCountryFilter === "Semua") {
        setActiveTab("All");
      } else {
        setActiveTab(selectedCountryFilter);
      }
    }
  }, [selectedCountryFilter]);

  // Map API alerts if present, or fallback to default
  const allItems: EWSAlertItem[] = useMemo(() => {
    if (alerts && alerts.length > 0) {
      return alerts.map((a, idx) => ({
        id: a.event_id || `ews-${idx}`,
        disease: formatDiseaseName(a.disease),
        location: a.location,
        country: a.country,
        status: a.severity === "AWAS" ? "CRITICAL" : a.severity || "CRITICAL",
        cases: a.cases || 0,
        deaths: a.deaths || 0,
        threshold: a.threshold || 1,
        confidence: a.confidence
          ? a.confidence > 1
            ? Math.round(a.confidence)
            : Math.round(a.confidence * 100)
          : 85,
        lastUpdated: a.latest_date || "Recent",
        eventId: a.event_id,
        latitude: a.latitude,
        longitude: a.longitude,
        eventCount: a.event_count,
      }));
    }
    return DEFAULT_EWS_ITEMS;
  }, [alerts]);

  // Compute available countries dynamically
  const countries = useMemo(() => {
    const list = ["All"];
    const standard = [
      "Indonesia",
      "Philippines",
      "Singapore",
      "Vietnam",
      "Cambodia",
      "Timor-Leste",
    ];
    allItems.forEach((item) => {
      if (item.country && !list.includes(item.country)) {
        list.push(item.country);
      }
    });
    standard.forEach((c) => {
      if (!list.includes(c)) list.push(c);
    });
    return list;
  }, [allItems]);

  // Filter based on selected tab
  const displayedItems = useMemo(() => {
    if (activeTab === "All" || activeTab === "All ASEAN Countries" || activeTab === "Semua") {
      return allItems;
    }
    return allItems.filter(
      (item) => item.country.toLowerCase() === activeTab.toLowerCase()
    );
  }, [allItems, activeTab]);

  const handleTabClick = (c: string) => {
    setActiveTab(c);
    if (onCountrySelect) {
      onCountrySelect(c);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3.5 transition-all">
        {/* ========================================================= */}
        {/* 1. HEADER                                                 */}
        {/* ========================================================= */}
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E2E8F0]/70">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FED889]/35 border border-[#C1A74F]/50 flex items-center justify-center text-[#B45309] flex-shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-[#B45309]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-black text-[#003396] tracking-tight uppercase">
                  EARLY WARNING SYSTEM
                </h3>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8.5px] font-black bg-red-100 text-[#BA1A1A] border border-red-200">
                  EWS
                </span>
                {isLoading && (
                  <Loader2 className="w-3 h-3 animate-spin text-[#003396]" />
                )}
              </div>
              <p className="text-[10.5px] font-medium text-[#737784] mt-0.5">
                Disease &amp; location based
              </p>
            </div>
          </div>

          {/* Count badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200/60 text-[10px] font-bold text-[#BA1A1A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A] animate-ping" />
            <span>{displayedItems.length} Active</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. COUNTRY FILTER CHIPS                                   */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {countries.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleTabClick(c)}
              className={`px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap text-[10.5px] cursor-pointer ${
                activeTab === c
                  ? "bg-[#003396] text-white shadow-xs"
                  : "bg-[#f8f9fc] text-[#424752] hover:bg-[#eceef0] border border-[#E2E8F0]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 3. ALERT CARDS LIST (REDESIGNED FOR MOBILE)               */}
        {/* ========================================================= */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-0.5 overscroll-contain">
          {displayedItems.length === 0 ? (
            <div className="p-6 text-center bg-[#f8f9fc] rounded-2xl border border-dashed border-[#E2E8F0] text-[#737784] text-xs">
              No EWS alerts found for this region.
            </div>
          ) : (
            displayedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedAlert(item);
                  setIsModalOpen(true);
                }}
                className="bg-[#f8f9fc] hover:bg-[#f1f4f9] rounded-2xl p-3.5 border border-[#E2E8F0] hover:border-[#BA1A1A]/35 transition-all cursor-pointer shadow-xs space-y-1.5 active:scale-[0.98] group"
              >
                {/* Top Row: Disease Title & Critical Badge */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-black text-[#191c1e] group-hover:text-[#003396] transition-colors tracking-tight">
                    {item.disease}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-[#BA1A1A] text-white shadow-xs">
                    {item.status}
                  </span>
                </div>

                {/* Second Row: Location */}
                <div className="flex items-center gap-1 text-[11px] font-medium text-[#5c6068]">
                  <MapPin className="w-3.5 h-3.5 text-[#737784] flex-shrink-0" />
                  <span className="truncate">
                    {item.location}{item.country ? `, ${item.country}` : ""}
                  </span>
                </div>

                {/* Third Row: cases • deaths • threshold */}
                <div className="pt-1 flex items-center justify-between border-t border-[#E2E8F0]/70 text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap font-medium text-[#424752]">
                    <span>
                      <strong className="font-extrabold text-[#003396]">
                        {item.cases.toLocaleString()}
                      </strong>{" "}
                      cases
                    </span>
                    <span className="text-[#9ca3af]">•</span>
                    <span>
                      <strong className="font-extrabold text-[#BA1A1A]">
                        {item.deaths.toLocaleString()}
                      </strong>{" "}
                      deaths
                    </span>
                    <span className="text-[#9ca3af]">•</span>
                    <span>
                      threshold <strong className="font-extrabold text-[#191c1e]">{item.threshold}</strong>
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-[#003396] group-hover:underline">
                    Details &rarr;
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ========================================================= */}
        {/* 4. FOOTER NOTE                                            */}
        {/* ========================================================= */}
        <div className="pt-2 border-t border-[#E2E8F0]/70 flex items-start gap-1.5 text-[10px] text-[#737784] leading-relaxed">
          <Info className="w-3.5 h-3.5 text-[#003396] flex-shrink-0 mt-0.5" />
          <p>
            EWS uses disease thresholds, location, confidence, and active user radius.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. POPUP MODAL (EVENT DETAILS)                            */}
      {/* ========================================================= */}
      <EwsDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alert={selectedAlert}
      />
    </>
  );
}
