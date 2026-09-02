"use client";

import React from "react";
import Image from "next/image";

export default function ABVCLogo() {
  return (
    <div className="flex flex-col items-center justify-center text-center select-none gap-2.5">
      {/* Official ABVC Emblem Container */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 bg-white shadow-md ring-4 ring-[#003396]/10 border-2 border-[#C1A74F] flex items-center justify-center transition-all duration-300 hover:shadow-lg">
        <Image
          src="/assets/images/icon_abvc.jpg"
          alt="ASEAN Biological Threats Surveillance Centre Logo"
          width={88}
          height={88}
          className="rounded-full object-contain"
          priority
        />
        {/* Status Biosecurity Pulse */}
        <span className="absolute bottom-0 right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border-2 border-white shadow-sm"></span>
        </span>
      </div>

      {/* Brand Acronym Tag */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003396]/10 border border-[#003396]/20 text-[11px] font-bold text-[#003396] tracking-wider uppercase">
        <span className="w-2 h-2 rounded-full bg-[#C1A74F]"></span>
        <span>ABVC REGIONAL SURVEILLANCE</span>
      </div>
    </div>
  );
}
