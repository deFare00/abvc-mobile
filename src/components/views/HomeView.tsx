"use client";

import React, { useState, useEffect } from "react";
import { OutbreakSignal, UserProfile } from "@/types/surveillance";
import { NavTab } from "@/components/FooterNav";
import SurveillanceMetrics from "@/components/SurveillanceMetrics";
import SurveillanceCategoriesCard from "@/components/SurveillanceCategoriesCard";
import EarlyWarningSystem from "@/components/EarlyWarningSystem";
import LocalAiSummaryCard from "@/components/LocalAiSummaryCard";
import MorbidityView from "@/components/views/MorbidityView";
import MortalityView from "@/components/views/MortalityView";
import PublicHealthEventView from "@/components/views/PublicHealthEventView";
import { fetchDashboardSummary } from "@/services/dashboardService";
import { DashboardSummaryData } from "@/types/dashboardApi";

interface HomeViewProps {
  user: UserProfile;
  signals: OutbreakSignal[];
  onOpenNlpModal: () => void;
  onNavigateTab: (tab: NavTab) => void;
  activeSubView?: "morbidity" | "mortality" | "phe" | null;
  onSubViewChange?: (view: "morbidity" | "mortality" | "phe" | null) => void;
}

export default function HomeView({
  user: _user,
  signals: _signals,
  onOpenNlpModal: _onOpenNlpModal,
  onNavigateTab: _onNavigateTab,
  activeSubView: externalSubView,
  onSubViewChange,
}: HomeViewProps) {
  // Country & Year Filter for Live Dashboard API
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [dashboardData, setDashboardData] = useState<DashboardSummaryData | null>(null);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);

  // Sub-view navigation state (fallback internal or controlled external)
  const [internalSubView, setInternalSubView] = useState<"morbidity" | "mortality" | "phe" | null>(null);

  const activeSubView = externalSubView !== undefined ? externalSubView : internalSubView;
  const setSubView = onSubViewChange || setInternalSubView;

  // Fetch live Dashboard Summary on mount and when filter changes
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsApiLoading(true);
      const data = await fetchDashboardSummary(selectedCountry, selectedYear);
      if (isMounted) {
        if (data) {
          setDashboardData(data);
        }
        setIsApiLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedCountry, selectedYear]);

  const handleFilterApply = (country: string, year: string) => {
    setSelectedCountry(country);
    setSelectedYear(year);
  };

  // If Morbidity dashboard is active, render MorbidityView
  if (activeSubView === "morbidity") {
    return <MorbidityView />;
  }

  // If Mortality dashboard is active, render MortalityView
  if (activeSubView === "mortality") {
    return <MortalityView />;
  }

  // If Public Health Event view is active, render PublicHealthEventView
  if (activeSubView === "phe") {
    return <PublicHealthEventView />;
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      {/* 1. SURVEILLANCE FILTER & 5 METRIC CARDS (POWERED BY LIVE API) */}
      <SurveillanceMetrics
        summaryCards={dashboardData?.summary_cards}
        availableYears={dashboardData?.filters?.available_years}
        isLoading={isApiLoading}
        selectedCountry={selectedCountry}
        selectedYear={selectedYear}
        onFilterApply={handleFilterApply}
      />

      {/* 2. SURVEILLANCE MENU CARD (Morbidity, Mortality, Public Health Event) */}
      <SurveillanceCategoriesCard
        onCategorySelect={(category) => {
          if (category === "morbidity") {
            setSubView("morbidity");
          } else if (category === "mortality") {
            setSubView("mortality");
          } else if (category === "phe") {
            setSubView("phe");
          }
        }}
      />

      {/* 3. EARLY WARNING SYSTEM (POWERED BY LIVE API ALERTS) */}
      <EarlyWarningSystem
        alerts={dashboardData?.early_warning_system?.alerts}
        isLoading={isApiLoading}
        selectedCountryFilter={selectedCountry}
        onCountrySelect={(country) => {
          setSelectedCountry(country);
        }}
      />

      {/* 4. LOCAL AI SUMMARY (POWERED BY LIVE API /api/v1/dashboard/summary) */}
      <LocalAiSummaryCard
        aiSummary={dashboardData?.ai_summary}
        isLoading={isApiLoading}
      />
    </div>
  );
}
