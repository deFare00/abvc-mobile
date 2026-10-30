"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import AnalysisModuleView from "@/components/views/AnalysisModuleView";

export default function AnalysisPage() {
  const router = useRouter();

  return (
    <MobileContainer>
      <AnalysisModuleView
        onBackToHome={() => router.push("/")}
        onNavigateModule={(mod) => {
          if (mod === "analysis") return;
          if (mod === "ebs") router.push("/ebs");
          if (mod === "ibs") router.push("/ibs");
        }}
      />
    </MobileContainer>
  );
}

