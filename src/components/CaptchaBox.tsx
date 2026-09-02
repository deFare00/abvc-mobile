"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface CaptchaBoxProps {
  onCodeChange: (code: string) => void;
  disabled?: boolean;
}

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export default function CaptchaBox({ onCodeChange, disabled }: CaptchaBoxProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [captchaText, setCaptchaText] = useState("TGAKK");
  const [isRotating, setIsRotating] = useState(false);

  // Generate random 5-character string
  const generateRandomCode = useCallback(() => {
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
    return result;
  }, []);

  // Draw captcha onto canvas
  const drawCaptcha = useCallback((text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas size
    canvas.width = 120;
    canvas.height = 42;

    // Clear background with soft gradient
    const gradient = ctx.createLinearGradient(0, 0, 120, 42);
    gradient.addColorStop(0, "#F1F5F9");
    gradient.addColorStop(1, "#E2E8F0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add random subtle background noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = i % 2 === 0 ? "rgba(0, 60, 135, 0.25)" : "rgba(117, 90, 23, 0.25)";
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Add random noise dots
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(0, 82, 180, 0.3)" : "rgba(133, 0, 1, 0.2)";
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1 + Math.random(),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw characters with slight rotation & spacing
    const startX = 14;
    const charSpacing = 20;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.save();
      const x = startX + i * charSpacing;
      const y = 28 + (Math.random() * 4 - 2);
      const angle = (Math.random() * 16 - 8) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font = "bold 20px 'Courier New', monospace, sans-serif";
      ctx.fillStyle = "#002B66";
      ctx.shadowColor = "rgba(0, 60, 135, 0.3)";
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Draw striking line through text
    ctx.strokeStyle = "rgba(0, 82, 180, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 20 + Math.random() * 6);
    ctx.bezierCurveTo(40, 12, 80, 28, 112, 18);
    ctx.stroke();
  }, []);

  const refreshCaptcha = () => {
    if (disabled) return;
    setIsRotating(true);
    const newCode = generateRandomCode();
    setCaptchaText(newCode);
    drawCaptcha(newCode);
    onCodeChange(newCode);
    setTimeout(() => setIsRotating(false), 500);
  };

  useEffect(() => {
    // Initial draw
    drawCaptcha(captchaText);
    onCodeChange(captchaText);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center bg-[#f0f4f8] rounded-full p-1 pl-2 pr-2 border border-[#d4e3f0] shadow-inner transition-all hover:border-[#aec6ff]">
      {/* Canvas Captcha */}
      <canvas
        ref={canvasRef}
        className="rounded-lg h-9 w-[112px] object-cover select-none pointer-events-none"
        title="Kode Keamanan Captcha"
      />

      {/* Refresh Button */}
      <button
        type="button"
        onClick={refreshCaptcha}
        disabled={disabled}
        className="ml-1 p-1.5 text-[#003c87] hover:text-[#0052b4] hover:bg-white/80 rounded-full transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#003c87]/30"
        title="Ganti Kode Keamanan"
        aria-label="Refresh Captcha"
      >
        <RefreshCw
          className={`w-4 h-4 text-[#0052b4] transition-transform duration-500 ${
            isRotating ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}
