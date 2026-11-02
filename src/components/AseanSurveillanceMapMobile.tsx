"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { WindLayer } from "ol-wind";
import { ASEAN_GEOJSON } from "@/data/asean-countries";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Settings,
  Wind,
  MapPin,
  X,
  ExternalLink,
  Building,
  RotateCcw,
} from "lucide-react";

export type BaseMapType = "osm" | "terrain" | "satellite" | "light" | "dark";
export type MarkerLookbackDays = 7 | 14 | 30 | 90;

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
  geo_level?: "point" | "location" | "province" | "national" | "none" | null;
  is_national?: boolean;
  source_type?: string | null;
  source_name?: string;
  source_url?: string;
  title?: string;
  sources?: Array<{
    source_name?: string;
    source_type?: string;
    url?: string;
    published_at?: string;
  }>;
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
  boundaryScope?: "asean" | "asean3" | "global";
  prototypeMode?: boolean;
  ebsOnly?: boolean;
}

function heatFill(cases: number, max: number): string {
  if (cases <= 0 || max <= 0) return "rgba(226, 232, 240, 0.45)";
  const intensity = Math.sqrt(Math.min(cases / max, 1));
  return `rgba(0, 96, 169, ${0.15 + intensity * 0.65})`;
}

function isWithinRecentWindow(
  dateValue: string | null | undefined,
  days: MarkerLookbackDays
): boolean {
  if (!dateValue) return true;
  const ts = Date.parse(dateValue);
  if (!Number.isFinite(ts)) return true;
  return ts >= Date.now() - days * 24 * 60 * 60 * 1000;
}

export default function AseanSurveillanceMapMobile({
  mode,
  locations = [],
  countries = [],
  selectedCountry,
  onSelectCountry,
  heightClass = "h-full min-h-[360px]",
  prototypeMode = true,
}: AseanSurveillanceMapMobileProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const vectorCountriesRef = useRef<VectorLayer<VectorSource> | null>(null);
  const vectorMarkersRef = useRef<VectorLayer<VectorSource> | null>(null);
  const baseTileRef = useRef<TileLayer<XYZ | OSM> | null>(null);
  const windLayerRef = useRef<any>(null);

  // Layer settings matching NLP Prototype (SpatialOutbreakMap)
  const [activeBase, setActiveBase] = useState<BaseMapType>(prototypeMode ? "light" : "osm");
  const [showMarkers, setShowMarkers] = useState(true);
  const [markerLookbackDays, setMarkerLookbackDays] = useState<MarkerLookbackDays>(30);
  const [showAdmin, setShowAdmin] = useState(true);
  const [showChoropleth, setShowChoropleth] = useState(true);
  const [showWind, setShowWind] = useState(false);
  const [showWindLegend, setShowWindLegend] = useState(false);
  const [showSpatialControls, setShowSpatialControls] = useState(false);

  // Selection states
  const [selectedMarker, setSelectedMarker] = useState<MapLocationMarker | null>(null);
  const [selectedCountryDetail, setSelectedCountryDetail] = useState<MapCountryData | null>(null);

  // Max cases for choropleth gradient
  const maxCases = useMemo(() => {
    return Math.max(...countries.map((c) => c.cases || 0), 1);
  }, [countries]);

  // Filter locations by lookback range
  const visibleLocations = useMemo(() => {
    if (!showMarkers) return [];
    return locations.filter((loc) => {
      const dt = loc.latest_date || loc.case_date;
      return isWithinRecentWindow(dt, markerLookbackDays);
    });
  }, [locations, showMarkers, markerLookbackDays]);

  // Reset layers to defaults
  const handleResetLayers = () => {
    setActiveBase(prototypeMode ? "light" : "osm");
    setShowMarkers(true);
    setMarkerLookbackDays(30);
    setShowAdmin(true);
    setShowChoropleth(true);
    setShowWind(false);
    setShowWindLegend(false);
  };

  // Basemap tile source factory
  const getTileSource = (base: BaseMapType) => {
    switch (base) {
      case "osm":
        return new OSM({ crossOrigin: "anonymous" });
      case "terrain":
        return new XYZ({
          url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png",
          crossOrigin: "anonymous",
        });
      case "satellite":
        return new XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          crossOrigin: "anonymous",
        });
      case "dark":
        return new XYZ({
          url: "https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          crossOrigin: "anonymous",
        });
      case "light":
      default:
        return new XYZ({
          url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          crossOrigin: "anonymous",
        });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapElement.current) return;

    // Basemap: Positron Light by default (matches prototype Carto Positron)
    const baseTile = new TileLayer({
      source: getTileSource("light"),
      zIndex: 1,
    });
    baseTileRef.current = baseTile;

    // Countries GeoJSON Boundary Layer
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

        const strokeColor = isHighlight
          ? "#003396"
          : prototypeMode && matched && (matched.cases || 0) > 0
          ? "#0060A9"
          : "rgba(148, 163, 184, 0.8)";
        const strokeWidth = isHighlight ? 2.5 : prototypeMode && matched && (matched.cases || 0) > 0 ? 1.4 : 0.8;

        return new Style({
          fill: new Fill({ color: fillColor }),
          stroke: new Stroke({
            color: strokeColor,
            width: strokeWidth,
          }),
        });
      },
    });
    vectorCountriesRef.current = countriesLayer;

    // Signal Markers Layer
    const markersSource = new VectorSource();
    const markersLayer = new VectorLayer({
      source: markersSource,
      zIndex: 10,
      visible: showMarkers,
    });
    vectorMarkersRef.current = markersLayer;

    // View initialization
    const initialView = new View({
      center: fromLonLat([115.0, 4.0]),
      zoom: mode === "analysis" ? 3.5 : 3.8,
      minZoom: 2.2,
      maxZoom: 14,
    });

    const map = new Map({
      target: mapElement.current,
      layers: [baseTile, countriesLayer, markersLayer],
      view: initialView,
      controls: defaultControls({ zoom: false, rotate: false, attribution: false }),
    });
    mapRef.current = map;

    // Map Click Handler
    map.on("click", (evt) => {
      let clickedMarkerData: MapLocationMarker | null = null;
      let clickedCountryName: string | null = null;

      map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => {
          if (layer === markersLayer) {
            clickedMarkerData = feature.get("markerData") as MapLocationMarker;
            return true;
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
      if (windLayerRef.current) {
        try {
          windLayerRef.current.setVisible?.(false);
          windLayerRef.current.stop?.();
          windLayerRef.current.dispose?.();
        } catch {}
        windLayerRef.current = null;
      }
      map.setTarget(undefined);
    };
  }, []);

  // Update Base Layer on activeBase change
  useEffect(() => {
    if (!baseTileRef.current) return;
    baseTileRef.current.setSource(getTileSource(activeBase));
  }, [activeBase]);

  // Update Admin Boundary Visibility
  useEffect(() => {
    if (!vectorCountriesRef.current) return;
    vectorCountriesRef.current.setVisible(showAdmin);
  }, [showAdmin]);

  // Update Markers Source
  useEffect(() => {
    if (!vectorMarkersRef.current) return;
    const source = vectorMarkersRef.current.getSource();
    if (!source) return;

    source.clear();

    const features: Feature<Point>[] = [];
    visibleLocations.forEach((loc) => {
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

      const isHot =
        loc.is_hot ||
        loc.cases >= 5000 ||
        loc.severity === "AWAS" ||
        loc.severity === "SIAGA" ||
        loc.severity === "TINGGI";

      const isNational = loc.is_national || loc.geo_level === "national";

      if (isNational) {
        // Hollow national centroid ring
        feature.setStyle([
          new Style({
            image: new CircleStyle({
              radius: 11,
              fill: new Fill({ color: "rgba(255, 255, 255, 0.55)" }),
              stroke: new Stroke({ color: "#0060A9", width: 3 }),
            }),
          }),
          new Style({
            image: new CircleStyle({
              radius: 3,
              fill: new Fill({ color: "#0060A9" }),
            }),
          }),
        ]);
      } else if (isHot) {
        // Multi-ring concentric ripple styling matching prototype
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
              fill: new Fill({ color: "rgba(0, 96, 169, 0.28)" }),
            }),
          }),
          new Style({
            image: new CircleStyle({
              radius: 5.5,
              fill: new Fill({ color: "#0060A9" }),
              stroke: new Stroke({ color: "#ffffff", width: 2 }),
            }),
          }),
        ]);
      } else {
        // Standard signal pin
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
  }, [visibleLocations, showMarkers]);

  // Update Countries Layer Style
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

      const strokeColor = isHighlight
        ? "#003396"
        : prototypeMode && matched && (matched.cases || 0) > 0
        ? "#0060A9"
        : "rgba(148, 163, 184, 0.8)";
      const strokeWidth = isHighlight ? 2.5 : prototypeMode && matched && (matched.cases || 0) > 0 ? 1.4 : 0.8;

      return new Style({
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({
          color: strokeColor,
          width: strokeWidth,
        }),
      });
    });
  }, [countries, selectedCountry, showChoropleth, maxCases, prototypeMode]);

  // Wind Flow (GFS) Layer handling
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (windLayerRef.current) {
      windLayerRef.current.setVisible?.(showWind);
      if (showWind) windLayerRef.current.start?.();
      else windLayerRef.current.stop?.();
      return;
    }

    if (!showWind) return;

    let cancelled = false;
    const initWind = async () => {
      try {
        const response = await fetch("/mobile/wind-data");
        if (!response.ok || cancelled) return;
        const windData = await response.json();
        const layer = new WindLayer(windData as any, {
          zIndex: 18,
          windOptions: {
            velocityScale: 0.015,
            paths: 350,
            colorScale: [
              "rgb(15,60,140)",
              "rgb(70,150,145)",
              "rgb(85,160,115)",
              "rgb(215,195,60)",
              "rgb(210,125,35)",
              "rgb(185,35,10)",
              "rgb(155,8,12)",
            ],
            lineWidth: 2.2,
            generateParticleOption: true,
          },
          fieldOptions: { wrapX: true },
        } as any);

        map.addLayer(layer as any);
        windLayerRef.current = layer;
        layer.setVisible?.(true);
        (layer as any).start?.();
      } catch (err) {
        console.warn("Could not initialize wind layer:", err);
      }
    };

    void initWind();
    return () => {
      cancelled = true;
    };
  }, [showWind]);

  // Navigation handlers
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
        center: fromLonLat([115.0, 4.0]),
        zoom: mode === "analysis" ? 3.5 : 3.8,
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

      {/* Floating Spatial Controls Button & Zoom Controls Top-Right */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        <button
          onClick={() => setShowSpatialControls(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white/95 px-2.5 py-1.5 text-slate-700 shadow-md backdrop-blur-md transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#0060A9] active:scale-95"
        >
          <Settings className="h-3.5 w-3.5 text-[#0060A9]" />
          <span className="text-[11px] font-black tracking-wide">
            Spatial Controls
          </span>
        </button>

        <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 text-slate-700 hover:bg-slate-100 active:scale-95 border-r border-slate-100"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 text-slate-700 hover:bg-slate-100 active:scale-95 border-r border-slate-100"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRecenter}
            title="Fit ASEAN Region"
            className="p-1.5 text-slate-700 hover:bg-slate-100 active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Active Info Badge Top-Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-[#0060A9] animate-pulse" />
          <span className="font-bold text-[#0060A9]">
            Signal Map
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 font-medium">
            {visibleLocations.length} Points ({markerLookbackDays}d)
          </span>
        </div>
      </div>

      {/* Wind Speed Gradient Bar Legend (matches prototype) */}
      {showWindLegend && showWind && (
        <div className="absolute bottom-3 left-3 z-20 max-w-[260px] sm:max-w-[300px] space-y-2 rounded-xl border border-blue-200/90 bg-white/95 p-3 shadow-[0_8px_30px_rgba(0,96,169,.12)] backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <div className="flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-[#0060A9]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                Wind Flow (GFS)
              </span>
            </div>
            <button
              onClick={() => setShowWindLegend(false)}
              className="rounded p-0.5 text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-[rgb(15,60,140)] via-[rgb(85,160,115)] via-[rgb(215,195,60)] via-[rgb(210,125,35)] to-[rgb(185,35,10)] shadow-inner" />
            <div className="flex justify-between px-0.5 text-[8px] font-bold text-slate-500">
              <span>0 km/h</span>
              <span>20 km/h</span>
              <span>40 km/h</span>
              <span>&gt;60 km/h</span>
            </div>
          </div>
        </div>
      )}

      {/* Case Burden Legend when Choropleth Active */}
      {showChoropleth && !showWindLegend && (
        <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/90 shadow-sm text-[10px]">
          <div className="text-[9px] font-black text-slate-700 tracking-wider uppercase mb-1">
            Case Density
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500">Low</span>
            <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-blue-100 via-blue-500 to-[#0060A9]" />
            <span className="text-[9px] text-[#0060A9] font-bold">High</span>
          </div>
        </div>
      )}

      {/* Spatial Controls Slide-over Side Panel (100% matched to prototype) */}
      {showSpatialControls && (
        <>
          <button
            onClick={() => setShowSpatialControls(false)}
            className="absolute inset-0 z-30 bg-black/20 backdrop-blur-xs transition-opacity"
            aria-label="Close"
          />
          <aside className="absolute right-0 top-0 bottom-0 z-40 flex h-full w-[min(320px,88%)] flex-col border-l border-slate-200 bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#0060A9]" />
                <span className="text-sm font-bold text-slate-800">
                  Spatial Controls
                </span>
              </div>
              <button
                onClick={() => setShowSpatialControls(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Settings Content */}
            <div className="flex-1 space-y-5 overflow-y-auto p-4 text-left">
              {/* MAP LAYERS */}
              <div>
                <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  MAP LAYERS
                </p>
                <div className="space-y-2">
                  {/* Signal Markers Row */}
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_36px] items-center gap-x-2.5 rounded-lg p-1.5 transition hover:bg-slate-50">
                    <span className="rounded-lg bg-slate-100 p-1.5 text-slate-600">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0" onClick={() => setShowMarkers(!showMarkers)}>
                      <span className="block break-words text-xs font-bold text-slate-800">
                        Signal Markers
                      </span>
                      <span className="block break-words text-[10px] text-slate-400">
                        Detected signal locations
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showMarkers}
                      onClick={() => setShowMarkers(!showMarkers)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        showMarkers ? "bg-[#0060A9]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          showMarkers ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Marker Lookback Range Selector */}
                  {showMarkers && (
                    <div className="ml-7 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                        MARKER TIME RANGE
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        {([7, 14, 30, 90] as const).map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setMarkerLookbackDays(days)}
                            className={`rounded-lg border px-2 py-1.5 text-[10px] font-bold transition cursor-pointer text-center ${
                              markerLookbackDays === days
                                ? "border-[#0060A9] bg-blue-50 text-[#0060A9]"
                                : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"
                            }`}
                          >
                            {days === 90 ? "3 Months" : `${days} Days`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Administrative Boundaries Row */}
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_36px] items-center gap-x-2.5 rounded-lg p-1.5 transition hover:bg-slate-50">
                    <span className="rounded-lg bg-slate-100 p-1.5 text-slate-600">
                      <Layers className="h-4 w-4" />
                    </span>
                    <div className="min-w-0" onClick={() => setShowAdmin(!showAdmin)}>
                      <span className="block break-words text-xs font-bold text-slate-800">
                        Administrative Boundaries
                      </span>
                      <span className="block break-words text-[10px] text-slate-400">
                        ASEAN GeoJSON boundary layer
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showAdmin}
                      onClick={() => setShowAdmin(!showAdmin)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        showAdmin ? "bg-[#0060A9]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          showAdmin ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Case Density Map (Choropleth) Row */}
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_36px] items-center gap-x-2.5 rounded-lg p-1.5 transition hover:bg-slate-50">
                    <span className="rounded-lg bg-slate-100 p-1.5 text-slate-600">
                      <Layers className="h-4 w-4" />
                    </span>
                    <div className="min-w-0" onClick={() => setShowChoropleth(!showChoropleth)}>
                      <span className="block break-words text-xs font-bold text-slate-800">
                        Case Density Map
                      </span>
                      <span className="block break-words text-[10px] text-slate-400">
                        Country color based on case count
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showChoropleth}
                      onClick={() => setShowChoropleth(!showChoropleth)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        showChoropleth ? "bg-[#0060A9]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          showChoropleth ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Wind Flow (GFS) Row */}
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_36px] items-center gap-x-2.5 rounded-lg p-1.5 transition hover:bg-slate-50">
                    <span className="rounded-lg bg-slate-100 p-1.5 text-slate-600">
                      <Wind className="h-4 w-4" />
                    </span>
                    <div
                      className="min-w-0"
                      onClick={() => {
                        const next = !showWind;
                        setShowWind(next);
                        setShowWindLegend(next);
                      }}
                    >
                      <span className="block break-words text-xs font-bold text-slate-800">
                        Wind Flow (GFS)
                      </span>
                      <span className="block break-words text-[10px] text-slate-400">
                        GFS atmospheric vector stream
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showWind}
                      onClick={() => {
                        const next = !showWind;
                        setShowWind(next);
                        setShowWindLegend(next);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        showWind ? "bg-[#0060A9]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          showWind ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* BASE MAP SELECTION */}
              <div>
                <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  BASE MAP
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(["light", "osm", "terrain", "satellite", "dark"] as BaseMapType[]).map((b) => (
                    <button
                      key={b}
                      onClick={() => setActiveBase(b)}
                      className={`rounded-xl border px-3 py-2 text-left text-[11px] font-bold capitalize transition ${
                        activeBase === b
                          ? "border-[#0060A9] bg-blue-50 text-[#0060A9] shadow-xs"
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset Footer Button */}
            <div className="border-t border-slate-100 p-3 bg-slate-50/50">
              <button
                onClick={handleResetLayers}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#0060A9] py-2 text-xs font-bold text-white transition hover:bg-[#004b85] active:scale-98 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Layers
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Marker Detail Bottom Sheet / Card */}
      {selectedMarker && (
        <div className="absolute bottom-2 left-2 right-2 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-blue-100 animate-in slide-in-from-bottom duration-200 max-h-48 overflow-y-auto no-scrollbar text-left">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-[#0060A9]">
                  {selectedMarker.disease || "Health Signal"}
                </span>
                {selectedMarker.severity && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      selectedMarker.severity === "AWAS" || selectedMarker.severity === "TINGGI"
                        ? "bg-red-500 text-white"
                        : selectedMarker.severity === "SIAGA"
                        ? "bg-amber-500 text-white"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {selectedMarker.severity === "AWAS" || selectedMarker.severity === "TINGGI"
                      ? "HIGH ALERT"
                      : selectedMarker.severity === "SIAGA"
                      ? "WARNING"
                      : selectedMarker.severity === "WASPADA"
                      ? "ALERT"
                      : selectedMarker.severity}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{selectedMarker.location_name}</span>
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
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 font-medium">Cases</div>
              <div className="text-xs font-black text-[#0060A9]">
                {(selectedMarker.cases || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 font-medium">Deaths</div>
              <div className="text-xs font-black text-rose-600">
                {(selectedMarker.deaths || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {selectedMarker.title && (
            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-normal">
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
                className="text-[#0060A9] hover:underline flex items-center gap-0.5 font-bold"
              >
                Article <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Country Detail Bottom Sheet / Card */}
      {selectedCountryDetail && !selectedMarker && (
        <div className="absolute bottom-2 left-2 right-2 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-blue-100 animate-in slide-in-from-bottom duration-200 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#0060A9]" />
              <h4 className="text-xs font-black text-slate-900">
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
            <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
              <div className="text-[10px] text-[#0060A9] font-bold">Total Cases</div>
              <div className="text-sm font-black text-[#0060A9]">
                {selectedCountryDetail.cases.toLocaleString()}
              </div>
            </div>
            <div className="bg-rose-50/60 p-2 rounded-xl border border-rose-100">
              <div className="text-[10px] text-rose-600 font-bold">Reported Deaths</div>
              <div className="text-sm font-black text-rose-700">
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
