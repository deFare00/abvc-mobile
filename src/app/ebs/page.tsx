"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import EbsModuleView from "@/components/views/EbsModuleView";

export default function EbsPage() {
  const router = useRouter();

  return (
    <MobileContainer>
      <EbsModuleView
        onBackToHome={() => router.push("/")}
        onNavigateModule={(mod) => {
          if (mod === "ebs") return;
          if (mod === "ibs") router.push("/ibs");
          if (mod === "analysis") router.push("/analysis");
        }}
      />
    </MobileContainer>
  );
}

