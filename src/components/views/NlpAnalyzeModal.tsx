"use client";

import React, { useState } from "react";
import { X, Sparkles, BrainCircuit, ShieldAlert, CheckCircle2, ArrowRight, Loader2, FileText } from "lucide-react";
import { OutbreakSignal } from "@/types/surveillance";

interface NlpAnalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSignal: (signal: OutbreakSignal) => void;
}

export default function NlpAnalyzeModal({
  isOpen,
  onClose,
  onAddSignal,
}: NlpAnalyzeModalProps) {
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<OutbreakSignal | null>(null);

  if (!isOpen) return null;

  const sampleTexts = [
    {
      title: "Sample 1: Mpox Border Screening",
      text: "Port health screening in Batam detected 2 ferry passengers from Singapore with acute febrile symptoms accompanied by lenticular lesions on palms and lymphadenopathy.",
      disease: "Mpox Clade Ib",
      pathogen: "Monkeypox virus",
      country: "Indonesia",
      location: "Batam International Seaport",
      threat: "High Alert" as const,
      confidence: 98.4,
    },
    {
      title: "Sample 2: Avian Flu Cluster",
      text: "Department of Animal Health identified sudden mortality among 450 waterfowl at a river delta farm, accompanied by severe respiratory symptoms among poultry workers.",
      disease: "Avian Influenza (H5N1)",
      pathogen: "Influenza A H5N1",
      country: "Vietnam",
      location: "Mekong Delta",
      threat: "Alert" as const,
      confidence: 96.1,
    },
  ];

  const handleAnalyze = () => {
    if (!textInput.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);

      // Simple heuristic based on input
      const isMpox = textInput.toLowerCase().includes("mpox") || textInput.toLowerCase().includes("lesi") || textInput.toLowerCase().includes("cacar");
      const isAvian = textInput.toLowerCase().includes("unggas") || textInput.toLowerCase().includes("flu") || textInput.toLowerCase().includes("h5n1");

      const generatedResult: OutbreakSignal = {
        id: `SIG-${Date.now().toString().slice(-4)}`,
        disease: isMpox ? "Mpox Clade Ib" : isAvian ? "Avian Influenza (H5N1)" : "Acute Febrile Illness / Bio-Anomaly",
        pathogen: isMpox ? "Monkeypox virus" : isAvian ? "Influenza A H5N1" : "Unidentified Biological Agent",
        country: textInput.toLowerCase().includes("batam") ? "Indonesia" : textInput.toLowerCase().includes("vietnam") ? "Vietnam" : "ASEAN Region",
        location: textInput.toLowerCase().includes("batam") ? "Batam Seaport" : "Regional Border Post",
        source: "AI NLP Multilingual Extractor",
        timestamp: "Just now",
        threatLevel: isMpox ? "High Alert" : "Alert",
        confidenceScore: 97.5,
        snippet: textInput.length > 100 ? textInput.substring(0, 100) + "..." : textInput,
        verified: true,
      };

      setAnalysisResult(generatedResult);
    }, 1200);
  };

  const handleSaveToFeed = () => {
    if (analysisResult) {
      onAddSignal(analysisResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E2E8F0] max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#003396] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#C1A74F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#001A42] rounded-xl border border-[#C1A74F]/40">
              <BrainCircuit className="w-5 h-5 text-[#fed889]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold leading-tight">NLP Text Detection &amp; Analysis</h2>
              <p className="text-[11px] text-[#b6ccff]">Disease Surveillance AI • ABVC Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-[#424752]">
          
          {/* Preset Samples */}
          <div>
            <span className="block text-[11px] font-bold text-[#191c1e] mb-1.5">
              Select Sample Text / Outbreak Rumor:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTexts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTextInput(sample.text);
                    setAnalysisResult(null);
                  }}
                  className="px-3 py-1 rounded-full bg-[#f8f9fc] hover:bg-[#d8e2ff] text-[#003396] font-semibold border border-[#E2E8F0] transition-colors text-[11px]"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Area */}
          <div>
            <label className="block text-[11px] font-bold text-[#191c1e] mb-1">
              Enter News Article Text / Field Symptom Report:
            </label>
            <textarea
              rows={4}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type or paste news text, outbreak rumors, or clinical notes in English, Indonesian, Malay, Vietnamese, or Thai..."
              className="w-full p-3 rounded-2xl bg-[#f8f9fc] border border-[#E2E8F0] text-xs text-[#191c1e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003396] transition-all resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Action Analyze Button */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !textInput.trim()}
            className="w-full py-3 bg-gradient-to-r from-[#003396] to-[#0052b4] hover:from-[#002266] hover:to-[#003c87] text-white font-extrabold text-xs rounded-full shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Disease Entities &amp; Spatial Locations...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#fed889]" />
                <span>Run AI NLP Extraction</span>
              </>
            )}
          </button>

          {/* Analysis Result Card */}
          {analysisResult && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-2xl space-y-2.5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pathogen Entities Successfully Extracted</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-extrabold text-[10px]">
                  Score: {analysisResult.confidenceScore}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">Detected Disease:</span>
                  <span className="font-bold text-[#003396]">{analysisResult.disease}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">Threat Level:</span>
                  <span className="font-bold text-[#E60012]">{analysisResult.threatLevel}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">Spatial Location:</span>
                  <span className="font-bold text-slate-800">{analysisResult.location}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">Country:</span>
                  <span className="font-bold text-slate-800">{analysisResult.country}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveToFeed}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow transition-all flex items-center justify-center gap-1.5"
              >
                <span>Save Signal to Surveillance Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
