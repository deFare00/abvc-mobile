"use client";

import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import { ASEAN_GEOJSON } from "@/data/asean-countries";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  MapPin,
  X,
  ExternalLink,
  ShieldAlert,
  Activity,
  Calendar,
  Building,
} from "lucide-react";

export interface MapLocationMarker {
  id?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  cases: number;
  deaths: number;
  disease?: string;
  severity?: string;
  is_hot?: boolean;
  country?: string;
  province?: string;
  case_date?: string;
  latest_date?: string;
  source_name?: string;
  source_url?: string;
  title?: string;
}

export interface MapCountryData {
  name: string;
  cases: number;
  deaths?: number;
  latest_week?: number;
  events?: number;
}

interface AseanSurveillanceMapMobileProps {
  mode: "ebs" | "ibs" | "analysis";
  locations?: MapLocationMarker[];
  countries?: MapCountryData[];
  selectedCountry?: string | null;
  onSelectCountry?: (country: string | null) => void;
  heightClass?: string;
}

function heatFill(cases: number, max: number): string {
  if (cases <= 0 || max <= 0) return "rgba(226, 232, 240, 0.45)";
  const intensity = Math.sqrt(Math.min(cases / max, 1));
  return `rgba(0, 96, 169, ${0.15 + intensity * 0.65})`;
}

export default function AseanSurveillanceMapMobile({
  mode,
  locations = [],
  countries = [],
  selectedCountry,
  onSelectCountry,
  heightClass = "h-full min-h-[360px]",
}: AseanSurveillanceMapMobileProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const vectorCountriesRef = useRef<VectorLayer<VectorSource> | null>(null);
  const vectorMarkersRef = useRef<VectorLayer<VectorSource> | null>(null);
  const baseTileRef = useRef<TileLayer<XYZ | OSM> | null>(null);

  const [activeBase, setActiveBase] = useState<"light" | "satellite" | "osm">("light");
  const [selectedMarker, setSelectedMarker] = useState<MapLocationMarker | null>(null);
  const [selectedCountryDetail, setSelectedCountryDetail] = useState<MapCountryData | null>(null);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showChoropleth, setShowChoropleth] = useState(mode !== "ebs");

  // Maximum cases calculation for Choropleth
  const maxCases = React.useMemo(() => {
    return Math.max(...countries.map((c) => c.cases || 0), 1);
  }, [countries]);

  // Initialize Map
  useEffect(() => {
    if (!mapElement.current) return;

    // Basemap: Positron Light by default
    const baseTile = new TileLayer({
      source: new XYZ({
        url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        crossOrigin: "anonymous",
      }),
      zIndex: 1,
    });
    baseTileRef.current = baseTile;

    // Countries Boundary Layer
    const countriesSource = new VectorSource({
      features: new GeoJSON().readFeatures(ASEAN_GEOJSON, {
        featureProjection: "EPSG:3857",
      }),
    });

    const countriesLayer = new VectorLayer({
      source: countriesSource,
      zIndex: 2,
      style: (feature) => {
        const countryName = String(feature.get("name") || "");
        const matched = countries.find(
          (c) =>
            c.name.toLowerCase() === countryName.toLowerCase() ||
            (countryName.toLowerCase() === "vietnam" && c.name.toLowerCase() === "viet nam")
        );
        const isHighlight =
          selectedCountry &&
          (countryName.toLowerCase() === selectedCountry.toLowerCase() ||
            (countryName.toLowerCase() === "vietnam" && selectedCountry.toLowerCase() === "viet nam"));

        let fillColor = "rgba(235, 240, 246, 0.4)";
        if (showChoropleth && matched) {
          fillColor = heatFill(matched.cases, maxCases);
        } else if (isHighlight) {
          fillColor = "rgba(0, 96, 169, 0.35)";
        }

        return new Style({
          fill: new Fill({ color: fillColor }),
          stroke: new Stroke({
            color: isHighlight ? "#003396" : "rgba(148, 163, 184, 0.8)",
            width: isHighlight ? 2.5 : 1.2,
          }),
        });
      },
    });
    vectorCountriesRef.current = countriesLayer;

    // Markers Layer
    const markersSource = new VectorSource();
    const markersLayer = new VectorLayer({
      source: markersSource,
      zIndex: 3,
      visible: showMarkers,
    });
    vectorMarkersRef.current = markersLayer;

    // OpenLayers Map Instance
    const initialView = new View({
      center: fromLonLat([114.0, 4.5]), // Centered over ASEAN
      zoom: mode === "analysis" ? 3.4 : 3.8,
      minZoom: 2.5,
      maxZoom: 14,
    });

    const map = new Map({
      target: mapElement.current,
      layers: [baseTile, countriesLayer, markersLayer],
      view: initialView,
      controls: defaultControls({ zoom: false, rotate: false, attribution: false }),
    });
    mapRef.current = map;

    // Click / Touch Event
    map.on("click", (evt) => {
      let clickedMarkerData: MapLocationMarker | null = null;
      let clickedCountryName: string | null = null;

      map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => {
          if (layer === markersLayer) {
            clickedMarkerData = feature.get("markerData") as MapLocationMarker;
            return true; // Stop iteration
          } else if (layer === countriesLayer && !clickedMarkerData) {
            clickedCountryName = String(feature.get("name") || "");
          }
        },
        { hitTolerance: 8 }
      );

      if (clickedMarkerData) {
        setSelectedMarker(clickedMarkerData);
        setSelectedCountryDetail(null);
      } else if (clickedCountryName) {
        const found = countries.find(
          (c) =>
            c.name.toLowerCase() === clickedCountryName!.toLowerCase() ||
            (clickedCountryName!.toLowerCase() === "vietnam" && c.name.toLowerCase() === "viet nam")
        );
        setSelectedCountryDetail(
          found || { name: clickedCountryName, cases: 0, deaths: 0 }
        );
        setSelectedMarker(null);
        if (onSelectCountry) onSelectCountry(clickedCountryName);
      } else {
        setSelectedMarker(null);
        setSelectedCountryDetail(null);
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Update Base Layer Tile Source
  useEffect(() => {
    if (!baseTileRef.current) return;
    if (activeBase === "light") {
      baseTileRef.current.setSource(
        new XYZ({
          url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          crossOrigin: "anonymous",
        })
      );
    } else if (activeBase === "satellite") {
      baseTileRef.current.setSource(
        new XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          crossOrigin: "anonymous",
        })
      );
    } else {
      baseTileRef.current.setSource(
        new OSM({
          crossOrigin: "anonymous",
        })
      );
    }
  }, [activeBase]);

  // Update Markers Source
  useEffect(() => {
    if (!vectorMarkersRef.current) return;
    const source = vectorMarkersRef.current.getSource();
    if (!source) return;

    source.clear();

    const features: Feature<Point>[] = [];
    locations.forEach((loc) => {
      if (
        typeof loc.latitude !== "number" ||
        typeof loc.longitude !== "number" ||
        isNaN(loc.latitude) ||
        isNaN(loc.longitude)
      ) {
        return;
      }

      const geom = new Point(fromLonLat([loc.longitude, loc.latitude]));
      const feature = new Feature({
        geometry: geom,
        markerData: loc,
      });

      const isHot = loc.is_hot || loc.cases >= 5000 || loc.severity === "AWAS" || loc.severity === "SIAGA";

      // Concentric circles for hot / prominent signals
      if (isHot) {
        feature.setStyle([
          new Style({
            image: new CircleStyle({
              radius: 14,
              fill: new Fill({ color: "rgba(0, 96, 169, 0.16)" }),
              stroke: new Stroke({ color: "rgba(0, 96, 169, 0.45)", width: 1.5 }),
            }),
          }),
          new Style({
            image: new CircleStyle({
              radius: 9,
              fill: new Fill({ color: "rgba(0, 96, 169, 0.3)" }),
            }),
          }),
          new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: mode === "analysis" ? "#0284c7" : "#0060A9" }),
              stroke: new Stroke({ color: "#ffffff", width: 2 }),
            }),
          }),
        ]);
      } else {
        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 5.5,
              fill: new Fill({ color: "#0060A9" }),
              stroke: new Stroke({ color: "#ffffff", width: 1.5 }),
            }),
          })
        );
      }

      features.push(feature);
    });

    source.addFeatures(features);
    vectorMarkersRef.current.setVisible(showMarkers);
  }, [locations, showMarkers, mode]);

  // Update Countries Layer Style on Countries/Choropleth/SelectedCountry changes
  useEffect(() => {
    if (!vectorCountriesRef.current) return;
    vectorCountriesRef.current.setStyle((feature) => {
      const countryName = String(feature.get("name") || "");
      const matched = countries.find(
        (c) =>
          c.name.toLowerCase() === countryName.toLowerCase() ||
          (countryName.toLowerCase() === "vietnam" && c.name.toLowerCase() === "viet nam")
      );
      const isHighlight =
        selectedCountry &&
        (countryName.toLowerCase() === selectedCountry.toLowerCase() ||
          (countryName.toLowerCase() === "vietnam" && selectedCountry.toLowerCase() === "viet nam"));

      let fillColor = "rgba(235, 240, 246, 0.45)";
      if (showChoropleth && matched) {
        fillColor = heatFill(matched.cases, maxCases);
      } else if (isHighlight) {
        fillColor = "rgba(0, 96, 169, 0.35)";
      }

      return new Style({
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({
          color: isHighlight ? "#003396" : "rgba(148, 163, 184, 0.8)",
          width: isHighlight ? 2.5 : 1.2,
        }),
      });
    });
  }, [countries, selectedCountry, showChoropleth, maxCases]);

  // Map Controls
  const handleZoomIn = () => {
    const view = mapRef.current?.getView();
    if (view) {
      view.animate({ zoom: (view.getZoom() || 4) + 0.8, duration: 250 });
    }
  };

  const handleZoomOut = () => {
    const view = mapRef.current?.getView();
    if (view) {
      view.animate({ zoom: (view.getZoom() || 4) - 0.8, duration: 250 });
    }
  };

  const handleRecenter = () => {
    const view = mapRef.current?.getView();
    if (view) {
      view.animate({
        center: fromLonLat([114.0, 4.5]),
        zoom: mode === "analysis" ? 3.4 : 3.8,
        duration: 400,
      });
    }
    setSelectedMarker(null);
    setSelectedCountryDetail(null);
  };

  return (
    <div className={`relative w-full ${heightClass} bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200 select-none`}>
      {/* OpenLayers Map Canvas */}
      <div ref={mapElement} className="w-full h-full" />

      {/* Floating Map Controls Top-Right */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-lg bg-white/95 text-slate-700 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-transform"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-lg bg-white/95 text-slate-700 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-transform"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          title="Fit ASEAN Region"
          className="w-8 h-8 rounded-lg bg-white/95 text-slate-700 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-transform"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          title="Map & Layer Settings"
          className={`w-8 h-8 rounded-lg ${
            showLayerMenu ? "bg-[#003396] text-white" : "bg-white/95 text-slate-700"
          } shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-transform`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Settings Dropdown */}
      {showLayerMenu && (
        <div className="absolute top-3 right-12 z-20 w-52 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-200 text-xs text-slate-800 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#003396]" />
              Map & Layers
            </span>
            <button onClick={() => setShowLayerMenu(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Base Map
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["light", "satellite", "osm"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBase(b)}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium capitalize text-center ${
                    activeBase === b
                      ? "bg-[#003396] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="text-[11px] font-medium text-slate-700">Outbreak Markers</span>
              <input
                type="checkbox"
                checked={showMarkers}
                onChange={(e) => setShowMarkers(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#003396] rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="text-[11px] font-medium text-slate-700">Choropleth Burden</span>
              <input
                type="checkbox"
                checked={showChoropleth}
                onChange={(e) => setShowChoropleth(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#003396] rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Floating Info Badge Top-Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <div className="bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-200/90 shadow-sm flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {mode === "ebs"
              ? `EBS Live • ${locations.length} Locations`
              : mode === "ibs"
              ? `IBS Outbreak • ${countries.length} Countries`
              : `Analysis Scope • ASEAN+3`}
          </span>
        </div>
      </div>

      {/* Bottom Floating Legend (IBS / Analysis Choropleth) */}
      {showChoropleth && (
        <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-200/90 shadow-sm text-[10px]">
          <div className="text-[9px] font-bold text-slate-700 tracking-wider uppercase mb-1">
            Case Burden
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500">Low</span>
            <div className="w-16 h-2 rounded-full bg-gradient-to-r from-blue-100 via-blue-500 to-[#003396]" />
            <span className="text-[9px] text-slate-500 font-semibold">Deep Blue</span>
          </div>
        </div>
      )}

      {/* Marker Detail Popup / Bottom Sheet */}
      {selectedMarker && (
        <div className="absolute bottom-2 left-2 right-2 z-20 bg-white rounded-xl p-3 shadow-2xl border border-blue-100 animate-in slide-in-from-bottom duration-200 max-h-48 overflow-y-auto no-scrollbar">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#003396]">
                  {selectedMarker.disease || "Health Signal"}
                </span>
                {selectedMarker.severity && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      selectedMarker.severity === "AWAS"
                        ? "bg-red-500 text-white"
                        : selectedMarker.severity === "SIAGA"
                        ? "bg-amber-500 text-white"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {selectedMarker.severity}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                {selectedMarker.location_name}
                {selectedMarker.country && (
                  <span className="text-[11px] font-normal text-slate-500">
                    , {selectedMarker.country}
                  </span>
                )}
              </h4>
            </div>

            <button
              onClick={() => setSelectedMarker(null)}
              className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 my-2 text-center">
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 font-medium">Cases</div>
              <div className="text-xs font-extrabold text-[#003396]">
                {selectedMarker.cases.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <div className="text-[10px] text-slate-500 font-medium">Deaths</div>
              <div className="text-xs font-extrabold text-rose-600">
                {selectedMarker.deaths.toLocaleString()}
              </div>
            </div>
          </div>

          {selectedMarker.title && (
            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
              {selectedMarker.title}
            </p>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
            <span>Source: {selectedMarker.source_name || "NLP Extraction"}</span>
            {selectedMarker.source_url && (
              <a
                href={selectedMarker.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#003396] hover:underline flex items-center gap-0.5 font-medium"
              >
                Article <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Country Detail Popup / Bottom Sheet */}
      {selectedCountryDetail && !selectedMarker && (
        <div className="absolute bottom-2 left-2 right-2 z-20 bg-white rounded-xl p-3 shadow-2xl border border-blue-100 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#003396]" />
              <h4 className="text-xs font-bold text-slate-900">
                {selectedCountryDetail.name}
              </h4>
            </div>
            <button
              onClick={() => {
                setSelectedCountryDetail(null);
                if (onSelectCountry) onSelectCountry(null);
              }}
              className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 my-2 text-center">
            <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100">
              <div className="text-[10px] text-blue-600 font-medium">Total Cases</div>
              <div className="text-sm font-extrabold text-[#003396]">
                {selectedCountryDetail.cases.toLocaleString()}
              </div>
            </div>
            <div className="bg-rose-50/60 p-2 rounded-lg border border-rose-100">
              <div className="text-[10px] text-rose-600 font-medium">Reported Deaths</div>
              <div className="text-sm font-extrabold text-rose-700">
                {(selectedCountryDetail.deaths || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {selectedCountryDetail.latest_week && (
            <div className="text-[10px] text-slate-500 text-center font-medium">
              Epi Reporting: Week {selectedCountryDetail.latest_week}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

