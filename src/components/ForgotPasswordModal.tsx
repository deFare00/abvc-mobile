"use client";

import React, { useState } from "react";
import { X, KeyRound, Mail, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [officerId, setOfficerId] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerId || !email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setOfficerId("");
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E2E8F0]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#003396] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#C1A74F]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#001A42] rounded-lg border border-[#C1A74F]/40">
              <KeyRound className="w-5 h-5 text-[#C1A74F]" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Pemulihan Kredensial</h2>
              <p className="text-xs text-[#b6ccff]">ASEAN ABVC Surveillance Officer</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#191c1e]">Tautan Otorisasi Terkirim</h3>
              <p className="text-xs text-[#424752] leading-relaxed">
                Token reset kata sandi telah dikirimkan ke email kedinasan <strong>{email}</strong> untuk ID Petugas <strong>{officerId}</strong>.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 px-6 py-2.5 bg-[#003396] text-white font-semibold text-xs rounded-full shadow hover:bg-[#002b66] transition-all"
              >
                Kembali ke Halaman Masuk
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#424752] leading-relaxed">
                Masukkan ID Petugas Surveilans dan email kedinasan terdaftar pada ABVC Regional Registry.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                  Surveillance Officer ID / NIP
                </label>
                <input
                  type="text"
                  required
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="Contoh: ABVC-ID-89240"
                  className="w-full px-4 py-2.5 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-xs text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#003396]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191c1e] mb-1">
                  Email Dinas Resmi
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@kemkes.go.id / @asean-abvc.org"
                    className="w-full px-4 py-2.5 pl-9 rounded-full bg-[#f8f9fc] border border-[#E2E8F0] text-xs text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#003396]"
                  />
                  <Mail className="w-4 h-4 text-[#737784] absolute left-3 top-3" />
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 bg-[#f8f9fc] rounded-lg border border-[#E2E8F0] text-[11px] text-[#737784]">
                <ShieldAlert className="w-4 h-4 text-[#C1A74F] flex-shrink-0 mt-0.5" />
                <span>
                  Akses modul surveilans biologis dipantau ketat di bawah protokol kerahasiaan data kesehatan regional ASEAN.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-medium text-[#424752] hover:bg-[#f2f4f6] rounded-full transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#003396] hover:bg-[#002b66] rounded-full shadow transition-all disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "Kirim Token Reset"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
