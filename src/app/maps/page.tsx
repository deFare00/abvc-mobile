"use client";

import React, { useState } from "react";
import MobileContainer from "@/components/MobileContainer";
import HeaderNav from "@/components/HeaderNav";
import FooterNav, { NavTab } from "@/components/FooterNav";
import MapView from "@/components/views/MapView";
import { defaultUser } from "@/data/mockSurveillance";
import { useRouter } from "next/navigation";

export default function MapsPage() {
  const router = useRouter();
  const [user] = useState(defaultUser);
  const [activeTab, setActiveTab] = useState<NavTab>("maps");

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === "home") {
      router.push("/");
    } else if (tab === "maps") {
      // Stay on page
    } else {
      router.push(`/?tab=${tab}`);
    }
  };

  return (
    <MobileContainer>
      <div className="w-full h-full flex flex-col overflow-hidden bg-[#f8f9fc] text-[#191c1e]">
        {/* Fixed Header */}
        <div className="flex-shrink-0 z-40 bg-[#003396]">
          <HeaderNav
            user={user}
            onLogout={() => router.push("/")}
            activeNotificationsCount={2}
          />
        </div>

        {/* Scrollable Maps Dashboard */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 overscroll-contain">
          <MapView />
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 z-40 bg-white">
          <FooterNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </MobileContainer>
  );
}
