"use client";

import React from "react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastAlertProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function ToastAlert({ message, type, onClose }: ToastAlertProps) {
  const getStyles = () => {
    switch (type) {
      case "error":
        return {
          bg: "bg-[#FFDAD6] text-[#93000A] border-[#BA1A1A]",
          icon: <AlertTriangle className="w-5 h-5 text-[#BA1A1A] flex-shrink-0" />,
        };
      case "warning":
        return {
          bg: "bg-[#FED889] text-[#785D1A] border-[#C1A74F]",
          icon: <AlertTriangle className="w-5 h-5 text-[#755A17] flex-shrink-0" />,
        };
      case "success":
        return {
          bg: "bg-emerald-100 text-emerald-900 border-emerald-500",
          icon: <CheckCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />,
        };
      case "info":
      default:
        return {
          bg: "bg-[#D8E2FF] text-[#001A42] border-[#003C87]",
          icon: <Info className="w-5 h-5 text-[#003C87] flex-shrink-0" />,
        };
    }
  };

  const style = getStyles();

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92%] px-4 py-3 rounded-xl border shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300 ${style.bg}`}
      role="alert"
    >
      <div className="flex items-center gap-2.5">
        {style.icon}
        <span className="text-xs font-semibold leading-tight">{message}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4 opacity-70 hover:opacity-100" />
      </button>
    </div>
  );
}
