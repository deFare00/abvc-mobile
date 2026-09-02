"use client";

import React from "react";

interface MobileContainerProps {
  children: React.ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="w-full min-h-dvh flex items-center justify-center bg-[#f8f9fc] sm:bg-slate-900 sm:p-4">
      {/* Mobile Web Viewport Container */}
      <main className="w-full max-w-[430px] h-dvh sm:h-[860px] sm:max-h-[94vh] bg-[#f8f9fc] flex flex-col sm:rounded-3xl shadow-2xl overflow-hidden border-0 sm:border border-[#E2E8F0]/30 relative">
        {children}
      </main>
    </div>
  );
}
