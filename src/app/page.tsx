"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, HelpCircle, Check, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import confetti from "canvas-confetti";
import MobileContainer from "@/components/MobileContainer";
import ABVCLogo from "@/components/ABVCLogo";
import CaptchaBox from "@/components/CaptchaBox";
import HelpModal from "@/components/HelpModal";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import ToastAlert, { ToastType } from "@/components/ToastAlert";
import PortalHomeView from "@/components/views/PortalHomeView";

export default function App() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login Form States
  const [username, setUsername] = useState("officer.asean");
  const [password, setPassword] = useState("••••••••");
  const [securityCode, setSecurityCode] = useState("");
  const [currentCaptcha, setCurrentCaptcha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Notifications
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
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
      showToast("Harap masukkan Surveillance ID atau NIP Anda.", "warning");
      return;
    }

    if (!password.trim()) {
      showToast("Harap masukkan Kata Sandi Otorisasi Anda.", "warning");
      return;
    }

    if (!securityCode.trim()) {
      showToast("Harap masukkan 5 digit Kode Keamanan (Captcha).", "warning");
      return;
    }

    if (securityCode.trim().toUpperCase() !== currentCaptcha.toUpperCase()) {
      showToast("Kode Keamanan tidak sesuai! Silakan periksa kembali.", "error");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsLoggedIn(true);
      setShowLogin(false);
      showToast("Otorisasi berhasil! Selamat datang di Modul EBS.", "success");
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
      router.push("/ebs");
    }, 900);
  };

  const handleFillDemo = () => {
    setUsername("officer.asean");
    setPassword("abvc2026");
    setSecurityCode(currentCaptcha);
    showToast("Kredensial demo ABVC berhasil diisikan.", "info");
  };

  const handleSelectModule = (mod: "ebs" | "ibs" | "analysis") => {
    if (mod === "ebs") router.push("/ebs");
    else if (mod === "ibs") router.push("/ibs");
    else if (mod === "analysis") router.push("/analysis");
  };

  return (
    <MobileContainer>
      {/* Toast Notification */}
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

      {/* PORTAL HOME (MAIN LANDING - 3 MODULES) */}
      {!showLogin ? (
        <PortalHomeView
          isLoggedIn={isLoggedIn}
          onSelectModule={handleSelectModule}
          onGoToLogin={() => setShowLogin(true)}
        />
      ) : (
        /* OFFICER LOGIN VIEW */
        <div className="relative w-full h-full flex flex-col justify-between bg-[#f8f9fc] text-[#191c1e] px-5 py-6 z-10 overflow-y-auto pt-[env(safe-area-inset-top,20px)] pb-[env(safe-area-inset-bottom,20px)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[#d8e2ff]/60 via-[#fed889]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-[#eceef0] to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
            style={{
              backgroundImage: `radial-gradient(#003396 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Top Bar with Back to Home Navigation */}
          <div className="w-full flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003396] hover:bg-[#d8e2ff]/50 px-3 py-1.5 rounded-full border border-[#003396]/20 transition-all bg-white/70 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>
            <span className="text-[10px] font-black text-[#737784] uppercase tracking-wider">
              Otorisasi Petugas
            </span>
          </div>

          {/* Top Header & Branding Section */}
          <div className="w-full flex flex-col items-center">
            <div className="mt-1 mb-2">
              <ABVCLogo />
            </div>

            <div className="text-center space-y-1 mb-5">
              <h1 className="text-[19px] sm:text-[21px] font-black text-[#003396] tracking-tight leading-snug">
                ASEAN Biological Threats<br />
                Surveillance Centre
              </h1>
              <p className="text-[10px] sm:text-[10.5px] font-bold tracking-wider text-[#737784] uppercase">
                PORTAL OTORISASI SURVEILANS REGIONAL
              </p>
            </div>

            {/* Login Form Container */}
            <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm max-w-[370px]">
              <form onSubmit={handleLogin} className="w-full space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#424752] uppercase tracking-wider pl-2">
                    Surveillance ID / NIP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan ID Petugas / NIP"
                      autoComplete="username"
                      className="w-full h-11 px-5 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-sm text-[#191c1e] font-semibold placeholder:text-[#737784] shadow-inner transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003396] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#424752] uppercase tracking-wider pl-2">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan Kata Sandi"
                      autoComplete="current-password"
                      className="w-full h-11 px-5 pr-12 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-sm text-[#191c1e] font-semibold placeholder:text-[#737784] tracking-widest focus:tracking-normal shadow-inner transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003396] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737784] hover:text-[#003396] p-1 transition-colors"
                      aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 pt-0.5">
                  <label className="block text-[11px] font-bold text-[#424752] uppercase tracking-wider pl-2">
                    Verifikasi Keamanan
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      <CaptchaBox onCodeChange={(code) => setCurrentCaptcha(code)} />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value.toUpperCase())}
                        placeholder="KODE CAPTCHA"
                        className="w-full h-11 px-3 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-xs font-black tracking-widest text-[#003396] uppercase placeholder:text-[#737784] placeholder:font-bold placeholder:tracking-wider placeholder:text-[10px] shadow-inner text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003396] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1 text-xs text-[#424752] font-medium select-none pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        rememberMe
                          ? "bg-[#003396] border-[#003396] text-white"
                          : "bg-white border-[#737784] group-hover:border-[#003396]"
                      }`}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-[11.5px] group-hover:text-[#003396] transition-colors">
                      Ingat Saya
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-[11.5px] text-[#003396] hover:underline font-semibold transition-colors"
                  >
                    Lupa kata sandi?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 mt-2 rounded-full bg-gradient-to-r from-[#003396] via-[#0052b4] to-[#003396] hover:from-[#002266] hover:to-[#003c87] text-white font-extrabold text-sm tracking-wide shadow-md shadow-[#003396]/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2 border border-[#C1A74F]/40"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Otorisasi...</span>
                    </>
                  ) : (
                    <span>Masuk Portal EBS</span>
                  )}
                </button>

                <div className="text-center pt-1.5">
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003396] hover:text-[#002266] hover:underline transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#003396]" />
                    <span>Panduan Pengguna &amp; SOP</span>
                  </button>
                </div>

                <div className="text-center pt-1 border-t border-[#E2E8F0]/80 mt-1.5">
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="inline-flex items-center gap-1 text-[11px] text-[#755a17] hover:text-[#410000] font-medium bg-[#fed889]/30 hover:bg-[#fed889]/60 px-3 py-1 rounded-full border border-[#C1A74F]/50 transition-all"
                    title="Klik untuk mengisi data uji coba ABVC secara instan"
                  >
                    <Sparkles className="w-3 h-3 text-[#C1A74F]" />
                    <span>Isi Otomatis Akun Demo ABVC</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6 text-center select-none space-y-1">
            <div className="flex items-center justify-center gap-2 text-[10px] text-[#737784] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>ASEAN Biological Surveillance Network • Active</span>
            </div>
            <p className="text-[10px] text-[#737784]/80">
              © 2026 ASEAN Biological Threats Surveillance Centre (ABVC)
            </p>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}
