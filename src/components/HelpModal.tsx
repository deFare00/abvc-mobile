"use client";

import React from "react";
import { X, ShieldCheck, MapPin, PhoneCall, KeyRound, Globe, Biohazard } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E2E8F0] max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#003396] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#C1A74F]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#001A42] rounded-lg border border-[#C1A74F]/40">
              <Biohazard className="w-5 h-5 text-[#C1A74F]" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">User Guide &amp; SOP</h2>
              <p className="text-xs text-[#b6ccff]">ASEAN Biological Threats Surveillance Centre</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-sm text-[#424752] divide-y divide-[#E2E8F0]">
          {/* Section 1: How to Enter Portal */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#003396] font-bold">
              <KeyRound className="w-4 h-4 text-[#C1A74F]" />
              <h3>1. Surveillance Officer Access Authorization</h3>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#191c1e] leading-relaxed">
              <li>
                Use your registered <strong>Username / Surveillance ID</strong> from the ABVC Regional Registry.
              </li>
              <li>
                Enter your encrypted authorization <strong>Password</strong>.
              </li>
              <li>
                Type the 5-character <strong>Security Code (Captcha)</strong> shown in the verification box.
              </li>
              <li>
                Click the <strong>Sign In to Portal</strong> button to access pathogen detection and reporting modules.
              </li>
            </ul>
          </div>

          {/* Section 2: Biosecurity & Geofencing Protocols */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center gap-2 text-[#003396] font-bold">
              <Globe className="w-4 h-4 text-[#0052b4]" />
              <h3>2. Cross-Border Geofencing &amp; Biosecurity Protocols</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#f8f9fc] p-2.5 rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center gap-1.5 font-semibold text-[#003396] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0052b4]" />
                  <span>Border Post GPS</span>
                </div>
                <p className="text-[11px] text-[#737784]">
                  Required for verifying point of entry, quarantine ports, airports, &amp; BSL-3/4 labs.
                </p>
              </div>
              <div className="bg-[#f8f9fc] p-2.5 rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center gap-1.5 font-semibold text-[#003396] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>E2E Encryption</span>
                </div>
                <p className="text-[11px] text-[#737784]">
                  Biological specimen telemetry is encrypted under ASEAN regional security standards.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Testing Credentials (Demo Mode) */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center gap-2 text-[#755a17] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#C1A74F]" />
              <h3>3. Testing Credentials (Demo Mode)</h3>
            </div>
            <div className="bg-[#fed889]/25 border border-[#C1A74F]/50 p-3 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-[#785d1a]">Quick Testing Credentials:</p>
              <p className="text-[#191c1e]">
                Surveillance ID: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#003396]">officer.asean</code> or <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#003396]">admin</code>
              </p>
              <p className="text-[#191c1e]">
                Password: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#003396]">abvc2026</code>
              </p>
            </div>
          </div>

          {/* Section 4: ABVC Command Center Contacts */}
          <div className="pt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-[#003396] font-bold">
              <PhoneCall className="w-4 h-4 text-[#0052b4]" />
              <h3>ABVC Command Center &amp; Regional Helpdesk</h3>
            </div>
            <p className="text-xs text-[#737784]">
              For biosafety emergencies or system access inquiries, contact the Command Center:
            </p>
            <p className="text-xs font-semibold text-[#003396]">
              🌐 surveillance@asean-abvc.org | 📞 Regional Hotline: +62 21-SURVEILLANCE
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="bg-[#f8f9fc] px-5 py-3 border-t border-[#E2E8F0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#003396] hover:bg-[#002b66] text-white font-semibold text-xs rounded-full shadow-sm transition-all cursor-pointer"
          >
            Understood &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
