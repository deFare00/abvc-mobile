"use client";

import React, { useState } from "react";
import { Eye, EyeOff, HelpCircle, Check, Loader2, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import MobileContainer from "@/components/MobileContainer";
import ABVCLogo from "@/components/ABVCLogo";
import CaptchaBox from "@/components/CaptchaBox";
import HelpModal from "@/components/HelpModal";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import ToastAlert, { ToastType } from "@/components/ToastAlert";
import HeaderNav from "@/components/HeaderNav";
import FooterNav, { NavTab } from "@/components/FooterNav";
import HomeView from "@/components/views/HomeView";
import SignalsView from "@/components/views/SignalsView";
import OutbreakLocationView from "@/components/views/OutbreakLocationView";
import DiseaseOverviewView from "@/components/views/DiseaseOverviewView";
import MapView from "@/components/views/MapView";
import NlpAnalyzeModal from "@/components/views/NlpAnalyzeModal";
import { defaultUser, mockSignals } from "@/data/mockSurveillance";
import { OutbreakSignal, UserProfile } from "@/types/surveillance";

export default function App() {
  // Authentication State (Default false to show login page directly)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>(defaultUser);

  // Login Form States
  const [username, setUsername] = useState("officer.asean");
  const [password, setPassword] = useState("abvc2026");
  const [securityCode, setSecurityCode] = useState("");
  const [currentCaptcha, setCurrentCaptcha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Navigation & Data States
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [homeSubView, setHomeSubView] = useState<"morbidity" | "mortality" | "phe" | null>(null);
  const [signals, setSignals] = useState<OutbreakSignal[]>(mockSignals);

  // Modals & Notifications
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isNlpModalOpen, setIsNlpModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      showToast("Please enter your Surveillance ID or NIP.", "warning");
      return;
    }

    if (!password.trim()) {
      showToast("Please enter your authorization password.", "warning");
      return;
    }

    if (!securityCode.trim()) {
      showToast("Please enter the 5-digit security captcha.", "warning");
      return;
    }

    if (securityCode.trim().toUpperCase() !== currentCaptcha.toUpperCase()) {
      showToast("Security code does not match! Please check again.", "error");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsLoggedIn(true);
      setActiveTab("home");
      showToast("Authorization successful! Welcome to ABVC Surveillance.", "success");
      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.65 },
          colors: ["#003396", "#C1A74F", "#0052B4", "#FED889"],
        });
      } catch {
        // Safe fallback
      }
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSecurityCode("");
    setActiveTab("home");
    showToast("You have been signed out from the portal session.", "info");
  };

  const handleAddSignal = (newSignal: OutbreakSignal) => {
    setSignals([newSignal, ...signals]);
    showToast(`New signal for ${newSignal.disease} successfully added!`, "success");
  };

  return (
    <MobileContainer>
      {/* Toast Notification (Always Available) */}
      {toast && (
        <ToastAlert
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Global Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
      <NlpAnalyzeModal
        isOpen={isNlpModalOpen}
        onClose={() => setIsNlpModalOpen(false)}
        onAddSignal={handleAddSignal}
      />

      {/* ========================================================= */}
      {/* SCENARIO A: AUTHENTICATED DASHBOARD (FIXED HEADER & FOOTER) */}
      {/* ========================================================= */}
      {isLoggedIn ? (
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#f8f9fc] text-[#191c1e]">

          {/* 1. Fixed Top Header (Never Scrolls) */}
          <div className="flex-shrink-0 z-40 bg-[#003396]">
            <HeaderNav
              user={user}
              onLogout={handleLogout}
              activeNotificationsCount={signals.filter((s) => s.threatLevel === "High Alert").length}
            />
          </div>

          {/* 2. Scrollable Middle Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 overscroll-contain">
            {activeTab === "home" && (
              <HomeView
                user={user}
                signals={signals}
                onOpenNlpModal={() => setIsNlpModalOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                activeSubView={homeSubView}
                onSubViewChange={setHomeSubView}
              />
            )}

            {activeTab === "signals" && (
              <SignalsView
                signals={signals}
                onOpenNlpModal={() => setIsNlpModalOpen(true)}
              />
            )}

            {activeTab === "matrix" && <OutbreakLocationView />}

            {activeTab === "history" && <DiseaseOverviewView />}

            {activeTab === "maps" && <MapView signals={signals} />}
          </div>

          {/* 3. Fixed Bottom Footer Navigation (Never Scrolls) */}
          <div className="flex-shrink-0 z-40 bg-white">
            <FooterNav
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab === "home") {
                  setHomeSubView(null);
                }
              }}
            />
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* SCENARIO B: CLEAN LOGIN VIEW WITH COVER BACKGROUND        */
        /* ========================================================= */
        <div className="relative w-full h-full flex flex-col justify-between text-[#191c1e] px-5 py-6 z-10 overflow-y-auto pt-[env(safe-area-inset-top,24px)] pb-[env(safe-area-inset-bottom,24px)]">

          {/* Official Cover Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20"
            style={{
              backgroundImage: "url('/mobile/assets/images/cover_abvc_mobile.jpg')",
            }}
          />

          {/* Elegant White/Translucent Backdrop Filter */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] -z-10" />

          {/* Top Header & Branding Section */}
          <div className="w-full flex flex-col items-center">

            {/* Header Brand Logo (Official ABVC Emblem) */}
            <div className="mt-2 mb-3">
              <ABVCLogo />
            </div>

            {/* Title and Subtitle */}
            <div className="text-center space-y-1 mb-6">
              <h1 className="text-[20px] sm:text-[22px] font-black text-[#003396] tracking-tight leading-snug">
                ASEAN Biological Threats<br />
                Surveillance Centre
              </h1>
              <p className="text-[10.5px] sm:text-[11px] font-bold tracking-wider text-[#424752] uppercase">
                REGIONAL SURVEILLANCE &amp; EARLY WARNING PORTAL
              </p>
            </div>

            {/* Login Form Container - Card Surface */}
            <div className="w-full bg-white/95 rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xl max-w-[370px] backdrop-blur-md">
              <form onSubmit={handleLogin} className="w-full space-y-3.5">

                {/* Field 1: Username / Surveillance Officer ID */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#424752] uppercase tracking-wider pl-2">
                    Surveillance ID / NIP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter Surveillance ID / NIP"
                      autoComplete="username"
                      className="w-full h-11 px-5 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-sm text-[#191c1e] font-semibold placeholder:text-[#737784] shadow-inner transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003396] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Field 2: Password with Eye Toggle */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#424752] uppercase tracking-wider pl-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      autoComplete="current-password"
                      className="w-full h-11 px-5 pr-12 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-sm text-[#191c1e] font-semibold placeholder:text-[#737784] tracking-widest focus:tracking-normal shadow-inner transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003396] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737784] hover:text-[#003396] p-1 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Field 3 & 4: Captcha Box + Security Code Input Row */}
                <div className="space-y-1 pt-0.5">
                  <label className="block text-[11px] font-bold text-[#424752] uppercase tracking-wider pl-2">
                    Security Verification
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Left: Dynamic Captcha Canvas Box */}
                    <div className="flex-shrink-0">
                      <CaptchaBox onCodeChange={(code) => setCurrentCaptcha(code)} />
                    </div>

                    {/* Right: Security Code Input */}
                    <div className="flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value.toUpperCase())}
                        placeholder="CAPTCHA CODE"
                        className="w-full h-11 px-3 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-xs font-black tracking-widest text-[#003396] uppercase placeholder:text-[#737784] placeholder:font-bold placeholder:tracking-wider placeholder:text-[10px] shadow-inner text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003396] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row: Remember Me & Forgot Password */}
                <div className="flex items-center justify-between px-1 text-xs text-[#424752] font-medium select-none pt-1">
                  {/* Remember Me Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe
                        ? "bg-[#003396] border-[#003396] text-white"
                        : "bg-white border-[#737784] group-hover:border-[#003396]"
                        }`}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-[11.5px] group-hover:text-[#003396] transition-colors">
                      Remember Me
                    </span>
                  </label>

                  {/* Forgot Password Link */}
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-[11.5px] text-[#003396] hover:underline font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button ("Sign In to Portal") */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 mt-2 rounded-full bg-gradient-to-r from-[#003396] via-[#0052b4] to-[#003396] hover:from-[#002266] hover:to-[#003c87] text-white font-extrabold text-sm tracking-wide shadow-md shadow-[#003396]/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2 border border-[#C1A74F]/40"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Authorization...</span>
                    </>
                  ) : (
                    <span>Sign In to Portal</span>
                  )}
                </button>

                {/* Help & SOP Link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003396] hover:text-[#002266] hover:underline transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#003396]" />
                    <span>User Guide &amp; SOP</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center select-none space-y-1">
            {/* <div className="flex items-center justify-center text-[10px] text-[#424752] font-semibold">
              <span>ASEAN Biological Surveillance Network • Active</span>
            </div> */}
            <p className="text-[10px] text-[#737784]/80">
              © 2026 ASEAN Biological Threats Surveillance Centre (ABVC)
            </p>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}
