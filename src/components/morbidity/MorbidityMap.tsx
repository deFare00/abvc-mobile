"use client";

import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import { ShieldAlert, Plus, Minus, RotateCcw, Info } from "lucide-react";
import { MorbidityHotspotArea } from "@/types/morbidity";

interface MorbidityMapProps {
  areas: MorbidityHotspotArea[];
}

export default function MorbidityMap({ areas }: MorbidityMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0].id);

  const selectedArea = areas.find((a) => a.id === selectedAreaId) || areas[0];

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    // Create vector source for hotspot markers
    const vectorSource = new VectorSource();

    areas.forEach((area) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(area.coordinates)),
        areaData: area,
      });

      // Color mapping
      let color = "#003396";
      let radius = 9;

      if (area.riskLevel === "CRITICAL") {
        color = "#BA1A1A";
        radius = 12;
      } else if (area.riskLevel === "HIGH") {
        color = "#EA580C";
        radius = 10;
      } else if (area.riskLevel === "MODERATE") {
        color = "#D97706";
        radius = 8;
      } else {
        color = "#0052B4";
        radius = 7;
      }

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: radius,
            fill: new Fill({ color: `${color}E6` }),
            stroke: new Stroke({ color: "#FFFFFF", width: 2.5 }),
          }),
          text: new Text({
            text: `${(area.cases / 1000).toFixed(0)}k`,
            font: "bold 9px sans-serif",
            fill: new Fill({ color: "#FFFFFF" }),
            offsetY: 0,
          }),
        })
      );

      vectorSource.addFeature(feature);
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 10,
    });

    // Base OSM layer with subtle opacity for elegant clean dashboard look
    const baseLayer = new TileLayer({
      source: new OSM(),
      opacity: 0.85,
    });

    // Center on ASEAN (Indonesia / Malaysia / South China Sea region)
    const map = new Map({
      target: mapElementRef.current,
      layers: [baseLayer, vectorLayer],
      view: new View({
        center: fromLonLat([112.0, 4.0]),
        zoom: 4.2,
        minZoom: 3.5,
        maxZoom: 10,
      }),
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
      }),
    });

    // Click handler on map features
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const data = feature.get("areaData") as MorbidityHotspotArea | undefined;
        if (data) {
          setSelectedAreaId(data.id);
        }
      }
    });

    mapRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, [areas]);

  // Zoom controls
  const handleZoom = (delta: number) => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    const currentZoom = view.getZoom() || 4.2;
    view.animate({ zoom: currentZoom + delta, duration: 250 });
  };

  const handleResetZoom = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      center: fromLonLat([112.0, 4.0]),
      zoom: 4.2,
      duration: 350,
    });
  };

  const handleSelectArea = (area: MorbidityHotspotArea) => {
    setSelectedAreaId(area.id);
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      center: fromLonLat(area.coordinates),
      zoom: 6.2,
      duration: 400,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#003396]"></span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
              TOP AFFECTED AREAS (MAPS)
            </h3>
            <span className="text-[10px] font-medium text-[#737784]">
              Spatial Outbreak Hotspots in ASEAN Region
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
          <ShieldAlert className="w-3 h-3 text-rose-600" />
          <span>{areas.length} Monitored Clusters</span>
        </div>
      </div>

      {/* Map Element Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#e5e7eb] shadow-inner">
        <div ref={mapElementRef} className="w-full h-full" />

        {/* Map Floating Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={() => handleZoom(0.8)}
            className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-sm border border-[#E2E8F0] flex items-center justify-center text-[#191c1e] shadow-sm active:scale-95 hover:bg-white"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-0.8)}
            className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-sm border border-[#E2E8F0] flex items-center justify-center text-[#191c1e] shadow-sm active:scale-95 hover:bg-white"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-sm border border-[#E2E8F0] flex items-center justify-center text-[#191c1e] shadow-sm active:scale-95 hover:bg-white"
            title="Reset Map Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Selected Area Badge on Map */}
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-[#E2E8F0] shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                selectedArea.riskLevel === "CRITICAL"
                  ? "bg-rose-600 animate-ping"
                  : selectedArea.riskLevel === "HIGH"
                  ? "bg-orange-500"
                  : "bg-amber-500"
              }`}
            />
            <div className="min-w-0">
              <span className="text-[11px] font-black text-[#191c1e] block truncate">
                {selectedArea.name} ({selectedArea.country})
              </span>
              <span className="text-[9.5px] font-semibold text-[#737784] block truncate">
                Pathogen: {selectedArea.primaryDisease}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0 pl-2">
            <span className="text-xs font-black text-[#003396] font-mono block">
              {selectedArea.cases.toLocaleString()}
            </span>
            <span className="text-[9px] font-bold text-[#737784]">
              {selectedArea.ratePer100k} / 100k
            </span>
          </div>
        </div>
      </div>

      {/* Hotspot Area Cards Grid */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-bold text-[#737784] uppercase tracking-wider block">
          Monitored Hotspot Clusters &amp; Threat Level:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {areas.map((area) => {
            const isSelected = selectedAreaId === area.id;

            return (
              <button
                key={area.id}
                type="button"
                onClick={() => handleSelectArea(area)}
                className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-blue-50/60 border-[#003396] ring-1 ring-[#003396]/30 shadow-xs"
                    : "bg-[#f8f9fc] hover:bg-white border-[#E2E8F0]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-black text-[#191c1e] truncate">
                    {area.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${
                      area.riskLevel === "CRITICAL"
                        ? "bg-rose-100 text-rose-700"
                        : area.riskLevel === "HIGH"
                        ? "bg-orange-100 text-orange-700"
                        : area.riskLevel === "MODERATE"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {area.riskLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-[#737784] truncate">{area.provinceOrState}</span>
                  <span className="font-mono font-black text-[#003396]">
                    {area.cases.toLocaleString()} cases
                  </span>
                </div>

                <div className="mt-1 pt-1 border-t border-[#E2E8F0]/70 flex items-center justify-between text-[9px] text-[#424752]">
                  <span className="truncate">Pathogen: {area.primaryDisease}</span>
                  <span className="font-semibold text-[#737784] flex-shrink-0">
                    {area.ratePer100k} / 100k
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[9.5px] text-[#737784] pt-1 border-t border-[#E2E8F0]/70">
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-[#003396]" />
          <span>Tap any location card to zoom and inspect the cluster</span>
        </div>
      </div>
    </div>
  );
}
