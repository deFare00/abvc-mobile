"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import IbsModuleView from "@/components/views/IbsModuleView";

export default function IbsPage() {
  const router = useRouter();

  return (
    <MobileContainer>
      <IbsModuleView
        onBackToHome={() => router.push("/")}
        onNavigateModule={(mod) => {
          if (mod === "ibs") return;
          if (mod === "ebs") router.push("/ebs");
          if (mod === "analysis") router.push("/analysis");
        }}
      />
    </MobileContainer>
  );
}

