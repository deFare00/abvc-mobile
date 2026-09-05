"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Fill, Stroke, Text, Circle as CircleStyle } from "ol/style";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import {
  MapPin,
  Plus,
  Minus,
  RotateCcw,
  Search,
  Calendar,
  ChevronDown,
  Check,
  Wind,
  Layers,
  ShieldAlert,
  AlertTriangle,
  Activity,
  X,
  Navigation,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { fetchDashboardSummary } from "@/services/dashboardService";
import { OutbreakSignal } from "@/types/surveillance";

// ASEAN Center Coordinates (approx 115°E, 4°N)
const ASEAN_CENTER_LON_LAT = [115.0, 4.0];
const DEFAULT_ZOOM = 4.3;

// Extent bounding box for ASEAN Region
const ASEAN_EXTENT = [
  ...fromLonLat([90.0, -12.0]),
  ...fromLonLat([143.0, 29.0]),
];

// Centroid fallbacks for ASEAN countries when latitude/longitude is null in API
const ASEAN_CENTROIDS: Record<string, [number, number]> = {
  Indonesia: [106.8456, -6.2088],
  Philippines: [120.9842, 14.5995],
  Singapore: [103.8198, 1.3521],
  Malaysia: [101.6869, 3.1390],
  Thailand: [100.5018, 13.7563],
  Vietnam: [105.8544, 21.0285],
  Cambodia: [104.9282, 11.5564],
  Laos: [102.6331, 17.9757],
  Myanmar: [96.1951, 16.8661],
  Brunei: [114.9481, 4.9031],
  "Timor-Leste": [125.5736, -8.5569],
};

function formatDiseaseName(rawName: string): string {
  if (!rawName) return "Unspecified";
  const lower = rawName.toLowerCase();
  if (lower.includes("dengue") || lower.includes("dbd")) return "Dengue Fever";
  if (lower.includes("tuberculosis") || lower.includes("tb")) return "Tuberculosis (TB)";
  if (lower.includes("leptospirosis")) return "Leptospirosis";
  if (lower.includes("measles")) return "Measles";
  if (lower.includes("mpox")) return "Mpox Clade Ib";
  if (lower.includes("avian") || lower.includes("h5n1")) return "Avian Influenza (H5N1)";
  if (lower.includes("cholera")) return "Cholera";
  if (lower.includes("rabies")) return "Rabies";
  if (lower.includes("malaria")) return "Malaria";
  if (lower.includes("zika")) return "Zika";
  if (lower.includes("chikungunya")) return "Chikungunya";

  return rawName
    .replace(/\s*\(dbd\)\s*/gi, " ")
    .replace(/\bdbd\b/gi, "")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export interface DynamicOutbreakMarker {
  id: string;
  location: string;
  country: string;
  coord: [number, number]; // [lon, lat]
  disease: string;
  cases: number;
  deaths: number;
  confidence: number;
  status: "CRITICAL" | "WARNING" | "NORMAL";
  latestDate?: string;
  eventCount?: number;
}

interface GfsGridData {
  uData: Float32Array | number[];
  vData: Float32Array | number[];
  nx: number;
  ny: number;
  lo1: number;
  la1: number;
  dx: number;
  dy: number;
  refTime?: string;
}

interface WindParticle {
  lon: number;
  lat: number;
  age: number;
  maxAge: number;
  speedMultiplier: number;
}

interface MapViewProps {
  signals?: OutbreakSignal[];
}

export default function MapView({ signals: _signals }: MapViewProps = {}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const baseTileLayerRef = useRef<TileLayer | null>(null);
  const outbreakVectorSourceRef = useRef<VectorSource | null>(null);
  const aseanVectorLayerRef = useRef<VectorLayer | null>(null);

  // Filter States
  const [selectedYear, setSelectedYear] = useState("2026");
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2025, 2024, 2023, 2022]);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement | null>(null);

  // Map & Visual Toggles
  const [isOsmBaseActive, setIsOsmBaseActive] = useState(true);
  const [isWindActive, setIsWindActive] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<DynamicOutbreakMarker | null>(null);
  const [tappedCountry, setTappedCountry] = useState<string | null>(null);

  // Data Loading States
  const [rawMarkers, setRawMarkers] = useState<DynamicOutbreakMarker[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // GFS Wind Grid Reference
  const gfsGridRef = useRef<GfsGridData | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 1. Fetch Live Outbreak Data from Backend API (/api/v1/dashboard/summary)
  useEffect(() => {
    let isMounted = true;

    async function loadOutbreakData() {
      setIsLoadingData(true);
      try {
        const countryParam = selectedCountry === "All" ? undefined : selectedCountry;
        const data = await fetchDashboardSummary(countryParam, selectedYear);

        if (isMounted && data) {
          if (data.filters?.available_years && data.filters.available_years.length > 0) {
            setAvailableYears(data.filters.available_years);
          }

          const markers: DynamicOutbreakMarker[] = [];
          const locations = data.location_summary || [];

          locations.forEach((item, idx) => {
            // Ignore outside ASEAN countries
            if (
              item.country === "OUTSIDE ASEAN" ||
              (item.country &&
                !Object.keys(ASEAN_CENTROIDS).some(
                  (c) => c.toLowerCase() === item.country.toLowerCase()
                ))
            ) {
              return;
            }

            let lon = item.longitude;
            let lat = item.latitude;

            // Fallback to Country Centroid if coordinates are null
            if (lon == null || lat == null) {
              const matchedCountryKey = Object.keys(ASEAN_CENTROIDS).find(
                (c) => c.toLowerCase() === (item.country || "").toLowerCase()
              );
              if (matchedCountryKey) {
                const centroid = ASEAN_CENTROIDS[matchedCountryKey];
                // Add jitter if duplicate
                const jitter = (idx % 7) * 0.18 - 0.54;
                lon = centroid[0] + jitter;
                lat = centroid[1] + jitter;
              }
            }

            if (lon != null && lat != null) {
              let status: "CRITICAL" | "WARNING" | "NORMAL" = "NORMAL";
              if (
                item.severity === "AWAS" ||
                item.severity === "CRITICAL" ||
                item.has_alert
              ) {
                status = "CRITICAL";
              } else if (item.severity === "WARNING" || item.severity === "SIAGA") {
                status = "WARNING";
              }

              const conf = item.confidence
                ? item.confidence > 1
                  ? Math.round(item.confidence)
                  : Math.round(item.confidence * 100)
                : 80;

              markers.push({
                id: item.event_id || `loc-${idx}`,
                location: item.location || item.country || "Unspecified",
                country: item.country || "ASEAN",
                coord: [lon, lat],
                disease: formatDiseaseName(item.disease),
                cases: item.cases || 0,
                deaths: item.deaths || 0,
                confidence: conf,
                status,
                latestDate: item.latest_date,
                eventCount: item.event_count,
              });
            }
          });

          // If location_summary was empty, fallback to EWS alerts
          if (markers.length === 0 && data.early_warning_system?.alerts) {
            data.early_warning_system.alerts.forEach((alert, idx) => {
              const matchedCentroid =
                alert.country && ASEAN_CENTROIDS[alert.country]
                  ? ASEAN_CENTROIDS[alert.country]
                  : [115.0, 4.0];

              const lon = alert.longitude ?? matchedCentroid[0];
              const lat = alert.latitude ?? matchedCentroid[1];

              markers.push({
                id: alert.event_id || `alert-${idx}`,
                location: alert.location || alert.country || "ASEAN Area",
                country: alert.country || "ASEAN",
                coord: [lon, lat],
                disease: formatDiseaseName(alert.disease),
                cases: alert.cases || 0,
                deaths: alert.deaths || 0,
                confidence: alert.confidence
                  ? alert.confidence > 1
                    ? Math.round(alert.confidence)
                    : Math.round(alert.confidence * 100)
                  : 85,
                status: alert.severity === "AWAS" ? "CRITICAL" : "WARNING",
                latestDate: alert.latest_date,
                eventCount: alert.event_count,
              });
            });
          }

          setRawMarkers(markers);
        }
      } catch (err) {
        console.error("Failed to load outbreak markers for MapView:", err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    loadOutbreakData();

    return () => {
      isMounted = false;
    };
  }, [selectedYear, selectedCountry]);

  // 2. Fetch GFS Wind Data from backend / mobile API proxy
  useEffect(() => {
    let isMounted = true;

    async function loadGfsData() {
      try {
        const res = await fetch("/mobile/api/gfs");
        if (!res.ok) return;

        const data = await res.json();
        if (!Array.isArray(data) || data.length < 2) return;

        let uItem = data.find(
          (d: { header?: { parameterCategory?: number; parameterNumber?: number } }) =>
            d.header?.parameterCategory === 2 && d.header?.parameterNumber === 2
        );
        let vItem = data.find(
          (d: { header?: { parameterCategory?: number; parameterNumber?: number } }) =>
            d.header?.parameterCategory === 2 && d.header?.parameterNumber === 3
        );

        if (!uItem || !vItem) {
          uItem = data[1];
          vItem = data[2];
        }

        if (uItem?.data && vItem?.data && isMounted) {
          gfsGridRef.current = {
            uData: uItem.data,
            vData: vItem.data,
            nx: uItem.header?.nx || 360,
            ny: uItem.header?.ny || 181,
            lo1: uItem.header?.lo1 ?? 0,
            la1: uItem.header?.la1 ?? 90,
            dx: uItem.header?.dx || 1,
            dy: uItem.header?.dy || 1,
            refTime: uItem.header?.refTime || new Date().toISOString(),
          };
        }
      } catch {
        // Fallback atmospheric model is used automatically
      }
    }

    loadGfsData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Filtered Markers based on Search and Country
  const filteredMarkers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return rawMarkers.filter((m) => {
      const matchSearch =
        !q ||
        m.location.toLowerCase().includes(q) ||
        m.disease.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q);

      const matchCountry =
        selectedCountry === "All" ||
        m.country.toLowerCase() === selectedCountry.toLowerCase();

      return matchSearch && matchCountry;
    });
  }, [rawMarkers, searchQuery, selectedCountry]);

  // 4. Initialize OpenLayers Map
  useEffect(() => {
    if (!mapElementRef.current) return;

    // Base OSM Tile Layer
    const baseLayer = new TileLayer({
      source: new OSM(),
      opacity: 0.88,
      visible: isOsmBaseActive,
    });
    baseTileLayerRef.current = baseLayer;

    // ASEAN Countries GeoJSON Layer
    const aseanVectorSource = new VectorSource({
      url: "/mobile/assets/data/asean_countries.geojson",
      format: new GeoJSON(),
    });

    const aseanStyleFunction = (feature: unknown) => {
      const f = feature as { get: (k: string) => string | undefined };
      const countryName =
        f.get("ADMIN") || f.get("name") || f.get("NAME") || "";

      return new Style({
        fill: new Fill({
          color: isOsmBaseActive
            ? "rgba(0, 51, 150, 0.05)"
            : "rgba(240, 215, 218, 0.95)",
        }),
        stroke: new Stroke({
          color: isOsmBaseActive ? "#003396" : "#424752",
          width: isOsmBaseActive ? 1.4 : 1.2,
        }),
        text: new Text({
          text: countryName,
          font: "bold 10px 'Public Sans', sans-serif",
          fill: new Fill({ color: "#003396" }),
          stroke: new Stroke({ color: "#FFFFFF", width: 2.5 }),
          offsetY: 0,
        }),
      });
    };

    const aseanVectorLayer = new VectorLayer({
      source: aseanVectorSource,
      style: aseanStyleFunction,
      zIndex: 5,
    });
    aseanVectorLayerRef.current = aseanVectorLayer;

    // Outbreak Markers Vector Source & Layer
    const outbreakSource = new VectorSource();
    outbreakVectorSourceRef.current = outbreakSource;

    const outbreakLayer = new VectorLayer({
      source: outbreakSource,
      zIndex: 15,
    });

    const view = new View({
      center: fromLonLat(ASEAN_CENTER_LON_LAT),
      zoom: DEFAULT_ZOOM,
      minZoom: 3.4,
      maxZoom: 11,
      extent: ASEAN_EXTENT,
      enableRotation: false,
    });

    const map = new Map({
      target: mapElementRef.current,
      layers: [baseLayer, aseanVectorLayer, outbreakLayer],
      view: view,
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
      }),
    });

    mapRef.current = map;

    // Handle Map Clicks
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const markerData = feature.get("markerData") as DynamicOutbreakMarker | undefined;
        if (markerData) {
          setSelectedMarker(markerData);
          setTappedCountry(null);
          return;
        }

        const countryName =
          (feature as { get: (k: string) => string | undefined }).get("ADMIN") ||
          (feature as { get: (k: string) => string | undefined }).get("name") ||
          (feature as { get: (k: string) => string | undefined }).get("NAME");

        if (countryName) {
          setTappedCountry(countryName);
          setSelectedMarker(null);
        }
      } else {
        setSelectedMarker(null);
        setTappedCountry(null);
      }
    });

    // Pointer cursor on hover over features
    map.on("pointermove", (e) => {
      const hit = map.hasFeatureAtPixel(e.pixel);
      map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  // Update Base Layer & GeoJSON style when isOsmBaseActive changes
  useEffect(() => {
    if (baseTileLayerRef.current) {
      baseTileLayerRef.current.setVisible(isOsmBaseActive);
    }
    if (aseanVectorLayerRef.current) {
      aseanVectorLayerRef.current.setStyle((feature: unknown) => {
        const f = feature as { get: (k: string) => string | undefined };
        const countryName =
          f.get("ADMIN") || f.get("name") || f.get("NAME") || "";

        return new Style({
          fill: new Fill({
            color: isOsmBaseActive
              ? "rgba(0, 51, 150, 0.05)"
              : "rgba(240, 215, 218, 0.95)",
          }),
          stroke: new Stroke({
            color: isOsmBaseActive ? "#003396" : "#424752",
            width: isOsmBaseActive ? 1.4 : 1.2,
          }),
          text: new Text({
            text: countryName,
            font: "bold 10px 'Public Sans', sans-serif",
            fill: new Fill({ color: "#003396" }),
            stroke: new Stroke({ color: "#FFFFFF", width: 2.5 }),
            offsetY: 0,
          }),
        });
      });
    }
  }, [isOsmBaseActive]);

  // 5. Synchronize Outbreak Features whenever filteredMarkers or selectedMarker changes
  useEffect(() => {
    if (!outbreakVectorSourceRef.current) return;
    const source = outbreakVectorSourceRef.current;
    source.clear();

    filteredMarkers.forEach((marker) => {
      const isSelected = selectedMarker?.id === marker.id;
      const isCritical = marker.status === "CRITICAL";
      const isWarning = marker.status === "WARNING";

      const primaryColor = isCritical
        ? "#BA1A1A"
        : isWarning
        ? "#D97706"
        : "#003396";

      const radius = isSelected
        ? 9
        : marker.cases > 500000
        ? 7.5
        : marker.cases > 50000
        ? 6.5
        : 5.5;

      const feature = new Feature({
        geometry: new Point(fromLonLat(marker.coord)),
        name: marker.location,
        markerData: marker,
      });

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: radius,
            fill: new Fill({ color: primaryColor }),
            stroke: new Stroke({
              color: isSelected ? "#C1A74F" : "#FFFFFF",
              width: isSelected ? 3 : 2,
            }),
          }),
          text: isSelected
            ? new Text({
                text: marker.location,
                font: "bold 10.5px 'Public Sans', sans-serif",
                fill: new Fill({ color: "#003396" }),
                stroke: new Stroke({ color: "#FFFFFF", width: 3 }),
                offsetY: -14,
              })
            : undefined,
        })
      );

      source.addFeature(feature);
    });
  }, [filteredMarkers, selectedMarker]);

  // 6. GFS Atmospheric Wind Particle Flow Overlay (Optional interactive toggle)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isWindActive) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particleCount = 180;
    const particles: WindParticle[] = [];

    const resetParticle = (p: WindParticle) => {
      p.lon = 92.0 + Math.random() * 49.0;
      p.lat = -10.5 + Math.random() * 34.0;
      p.age = 0;
      p.maxAge = 40 + Math.random() * 45;
      p.speedMultiplier = 0.9 + Math.random() * 0.4;
    };

    for (let i = 0; i < particleCount; i++) {
      const p: WindParticle = {
        lon: 0,
        lat: 0,
        age: 0,
        maxAge: 60,
        speedMultiplier: 1,
      };
      resetParticle(p);
      p.age = Math.random() * p.maxAge;
      particles.push(p);
    }

    const interpolateGfsVector = (lon: number, lat: number) => {
      const grid = gfsGridRef.current;
      if (!grid) {
        const u = Math.cos(lat * 0.1) * 3.5 + 4.5;
        const v = -Math.sin(lon * 0.08) * 2.5 - 1.2;
        return { u, v, speed: Math.sqrt(u * u + v * v) };
      }

      const lonNorm = ((lon % 360) + 360) % 360;
      const x = (lonNorm - grid.lo1) / grid.dx;
      const y = (grid.la1 - lat) / grid.dy;

      const x0 = Math.floor(x);
      const x1 = (x0 + 1) % grid.nx;
      const y0 = Math.floor(y);
      const y1 = Math.min(y0 + 1, grid.ny - 1);

      if (y0 < 0 || y0 >= grid.ny) {
        return { u: 3, v: -1, speed: 3.16 };
      }

      const fx = x - x0;
      const fy = y - y0;

      const idx00 = y0 * grid.nx + x0;
      const idx10 = y0 * grid.nx + x1;
      const idx01 = y1 * grid.nx + x0;
      const idx11 = y1 * grid.nx + x1;

      const u00 = grid.uData[idx00] || 0;
      const u10 = grid.uData[idx10] || 0;
      const u01 = grid.uData[idx01] || 0;
      const u11 = grid.uData[idx11] || 0;

      const v00 = grid.vData[idx00] || 0;
      const v10 = grid.vData[idx10] || 0;
      const v01 = grid.vData[idx01] || 0;
      const v11 = grid.vData[idx11] || 0;

      const u =
        (1 - fx) * (1 - fy) * u00 +
        fx * (1 - fy) * u10 +
        (1 - fx) * fy * u01 +
        fx * fy * u11;

      const v =
        (1 - fx) * (1 - fy) * v00 +
        fx * (1 - fy) * v10 +
        (1 - fx) * fy * v01 +
        fx * fy * v11;

      return { u, v, speed: Math.sqrt(u * u + v * v) };
    };

    const render = () => {
      const currentMap = mapRef.current;
      if (!currentMap) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const size = currentMap.getSize();
      if (!size) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const [width, height] = size;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.fillStyle = "rgba(248, 250, 252, 0.16)";
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.age++;
        if (p.age > p.maxAge) {
          resetParticle(p);
          return;
        }

        const vector = interpolateGfsVector(p.lon, p.lat);
        const dt = 0.055 * p.speedMultiplier;

        const startPixel = currentMap.getPixelFromCoordinate(fromLonLat([p.lon, p.lat]));

        p.lon += (vector.u * dt) / Math.cos((p.lat * Math.PI) / 180);
        p.lat += vector.v * dt;

        const endPixel = currentMap.getPixelFromCoordinate(fromLonLat([p.lon, p.lat]));

        if (startPixel && endPixel) {
          if (
            startPixel[0] < -20 ||
            startPixel[0] > width + 20 ||
            startPixel[1] < -20 ||
            startPixel[1] > height + 20
          ) {
            resetParticle(p);
            return;
          }

          const lifeProgress = p.age / p.maxAge;
          const alpha = Math.sin(lifeProgress * Math.PI) * 0.75;

          if (vector.speed > 8) {
            ctx.strokeStyle = `rgba(217, 119, 6, ${alpha})`;
          } else if (vector.speed > 4.5) {
            ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
          } else {
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
          }

          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";

          ctx.beginPath();
          ctx.moveTo(startPixel[0], startPixel[1]);
          ctx.lineTo(endPixel[0], endPixel[1]);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isWindActive]);

  // Navigation Handlers
  const handleZoomIn = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      zoom: (view.getZoom() || DEFAULT_ZOOM) + 0.6,
      duration: 250,
    });
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      zoom: (view.getZoom() || DEFAULT_ZOOM) - 0.6,
      duration: 250,
    });
  };

  const handleResetAseanView = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      center: fromLonLat(ASEAN_CENTER_LON_LAT),
      zoom: DEFAULT_ZOOM,
      duration: 350,
    });
    setSelectedMarker(null);
    setTappedCountry(null);
  };

  const handleFlyToMarker = (marker: DynamicOutbreakMarker) => {
    setSelectedMarker(marker);
    setTappedCountry(null);
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      center: fromLonLat(marker.coord),
      zoom: 6.8,
      duration: 400,
    });
  };

  // Top ASEAN Countries for Filter Chips
  const countryOptions = [
    "All",
    "Indonesia",
    "Philippines",
    "Singapore",
    "Malaysia",
    "Thailand",
    "Vietnam",
    "Cambodia",
    "Myanmar",
    "Brunei",
  ];

  // Top Outbreak Hotspots for Quick Inspection
  const topHotspots = useMemo(() => {
    return [...filteredMarkers]
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 6);
  }, [filteredMarkers]);

  return (
    <div className="space-y-3.5 pb-6 animate-in fade-in duration-300">
      {/* 1. Header Card with Year Selector */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm flex items-center justify-between gap-3 relative z-30">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-[#003396] tracking-tight uppercase">
              ASEAN DISEASE SURVEILLANCE MAP
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs font-medium text-[#5c6068] mt-0.5 leading-snug">
            Interactive OpenLayers regional mapping &amp; outbreak spatial distribution
          </p>
        </div>

        {/* Custom Year Dropdown Popover */}
        <div ref={yearDropdownRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsYearDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer focus:outline-none ${
              isYearDropdownOpen
                ? "border-[#003396] shadow-md ring-2 ring-[#003396]/15 bg-white"
                : "border-[#E2E8F0] bg-[#f8f9fc] hover:bg-white hover:border-[#003396]/40 shadow-xs"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#003396]" />
            <span className="text-xs font-bold text-[#191c1e]">{selectedYear}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#737784] transition-transform duration-200 ${
                isYearDropdownOpen ? "rotate-180 text-[#003396]" : ""
              }`}
            />
          </button>

          {isYearDropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-36 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="max-h-56 overflow-y-auto space-y-0.5 overscroll-contain pr-1 custom-scrollbar">
                {availableYears.map((y) => {
                  const isSelected = String(selectedYear) === String(y);
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setSelectedYear(String(y));
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#003396] text-white font-bold shadow-xs"
                          : "text-[#334155] hover:bg-[#f1f5f9] hover:text-[#003396] font-semibold"
                      }`}
                    >
                      <span>{y}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[2.5] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Search & Country Filter Chips */}
      <div className="bg-white rounded-3xl p-3.5 border border-[#E2E8F0] shadow-sm space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#737784] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by city, country or pathogen..."
            className="w-full pl-9 pr-3.5 py-2 bg-[#f8f9fc] rounded-2xl border border-[#E2E8F0] text-xs font-semibold text-[#191c1e] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#003396] transition-colors"
          />
        </div>

        {/* Country Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {countryOptions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap text-[10.5px] cursor-pointer ${
                selectedCountry === c
                  ? "bg-[#003396] text-white shadow-xs"
                  : "bg-[#f8f9fc] text-[#424752] hover:bg-[#eceef0] border border-[#E2E8F0]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Summary Stats & Layer Switcher Bar */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f5ff] border border-[#d8e2ff] text-[10.5px] font-bold text-[#003396]">
          <MapPin className="w-3.5 h-3.5 text-[#003396]" />
          <span>
            {isLoadingData
              ? "Loading outbreak points..."
              : `ASEAN • ${filteredMarkers.length} Outbreak Locations`}
          </span>
        </div>

        {/* Layer Controls (OSM Basemap & GFS Wind Toggle) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsOsmBaseActive(!isOsmBaseActive)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
              isOsmBaseActive
                ? "bg-[#003396] text-white border-[#003396] shadow-xs"
                : "bg-white text-[#737784] border-[#E2E8F0] hover:bg-[#f8f9fc]"
            }`}
            title="Toggle OpenStreetMap base tiles"
          >
            <Layers className="w-3 h-3" />
            <span>OSM Map</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWindActive(!isWindActive)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
              isWindActive
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white text-[#737784] border-[#E2E8F0] hover:bg-[#f8f9fc]"
            }`}
            title="Toggle GFS Wind Stream Overlay"
          >
            <Wind className="w-3 h-3" />
            <span>Wind</span>
          </button>
        </div>
      </div>

      {/* 4. Main OpenLayers Map Container */}
      <div className="relative w-full h-[470px] sm:h-[530px] bg-[#E2E8F0] rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-md">
        {/* OpenLayers Map Canvas Container */}
        <div
          ref={mapElementRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        />

        {/* Wind Particle Canvas Overlay */}
        {isWindActive && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-10 w-full h-full"
          />
        )}

        {/* Loading Spinner Overlay */}
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-30 pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-lg border border-[#E2E8F0]">
              <Loader2 className="w-4 h-4 text-[#003396] animate-spin" />
              <span className="text-xs font-bold text-[#003396]">
                Syncing Outbreak Geo Data...
              </span>
            </div>
          </div>
        )}

        {/* Selected Country Badge (When tapped on country boundary) */}
        {tappedCountry && (
          <div className="absolute top-3.5 right-3.5 z-20 pointer-events-none animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1 bg-[#003396] text-white text-[11px] font-bold rounded-xl shadow-md border border-[#C1A74F]">
              Negara: {tappedCountry}
            </div>
          </div>
        )}

        {/* Top-Left: Zoom & Reset Navigation Controls */}
        <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 pointer-events-auto select-none">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-[#003396] font-extrabold shadow-sm border border-[#E2E8F0] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-[#003396] font-extrabold shadow-sm border border-[#E2E8F0] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Minus className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handleResetAseanView}
            className="w-8 h-8 rounded-xl bg-[#003396] text-white hover:bg-[#002266] font-bold shadow-md border border-[#C1A74F]/50 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            title="Reset to ASEAN View"
            aria-label="Reset ASEAN View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top-Right: Map Legend */}
        <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] shadow-sm text-[10px] text-[#424752] flex items-center gap-2 z-20 pointer-events-none">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BA1A1A] inline-block ring-2 ring-red-100" />
            <span className="font-bold text-[#BA1A1A]">Critical</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] inline-block ring-2 ring-amber-100" />
            <span className="font-bold text-[#D97706]">Warning</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#003396] inline-block ring-2 ring-blue-100" />
            <span className="font-bold text-[#003396]">Normal</span>
          </span>
        </div>

        {/* Floating Selected Outbreak Marker Card (Bottom) */}
        {selectedMarker && (
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#E2E8F0] shadow-xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-2 border-b border-[#E2E8F0]/70 pb-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    selectedMarker.status === "CRITICAL"
                      ? "bg-[#BA1A1A] animate-ping"
                      : selectedMarker.status === "WARNING"
                      ? "bg-[#D97706]"
                      : "bg-[#003396]"
                  }`}
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-[#191c1e] truncate leading-tight">
                    {selectedMarker.location}
                  </h4>
                  <p className="text-[10px] font-semibold text-[#737784]">
                    {selectedMarker.country} • Lat: {selectedMarker.coord[1].toFixed(2)}°, Lon: {selectedMarker.coord[0].toFixed(2)}°
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    selectedMarker.status === "CRITICAL"
                      ? "bg-red-100 text-[#BA1A1A] border border-red-200"
                      : selectedMarker.status === "WARNING"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-blue-100 text-[#003396] border border-blue-200"
                  }`}
                >
                  {selectedMarker.status}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedMarker(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-1">
              <div className="bg-[#f8f9fc] rounded-xl p-2 border border-[#E2E8F0]/80">
                <span className="text-[9.5px] font-bold text-[#737784] block truncate">
                  Pathogen
                </span>
                <span className="text-[11px] font-black text-[#003396] truncate block mt-0.5">
                  {selectedMarker.disease}
                </span>
              </div>
              <div className="bg-[#f8f9fc] rounded-xl p-2 border border-[#E2E8F0]/80">
                <span className="text-[9.5px] font-bold text-[#737784] block truncate">
                  Cases
                </span>
                <span className="text-[11.5px] font-black text-[#191c1e] font-mono block mt-0.5">
                  {selectedMarker.cases.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#f8f9fc] rounded-xl p-2 border border-[#E2E8F0]/80">
                <span className="text-[9.5px] font-bold text-[#737784] block truncate">
                  Deaths
                </span>
                <span className="text-[11.5px] font-black text-[#BA1A1A] font-mono block mt-0.5">
                  {selectedMarker.deaths.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#E2E8F0]/70 text-[9.5px] text-[#737784]">
              <span>
                Confidence: <strong className="text-[#191c1e]">{selectedMarker.confidence}%</strong>
                {selectedMarker.latestDate && ` • ${selectedMarker.latestDate}`}
              </span>

              <button
                type="button"
                onClick={() => handleFlyToMarker(selectedMarker)}
                className="px-2.5 py-1 bg-[#003396] text-white rounded-lg font-bold hover:bg-[#002266] flex items-center gap-1 text-[10px] cursor-pointer shadow-2xs"
              >
                <Navigation className="w-2.5 h-2.5" />
                <span>Zoom In</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Quick Outbreak Hotspots List */}
      {topHotspots.length > 0 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8F0]/70 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#BA1A1A]"></span>
              <h3 className="text-xs sm:text-sm font-black text-[#191c1e] uppercase tracking-tight">
                TOP DETECTED OUTBREAK HOTSPOTS
              </h3>
            </div>
            <span className="text-[10px] font-bold text-[#737784]">
              Tap card to locate on map
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topHotspots.map((hotspot) => {
              const isSelected = selectedMarker?.id === hotspot.id;

              return (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => handleFlyToMarker(hotspot)}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/70 border-[#003396] ring-1 ring-[#003396]/30 shadow-xs"
                      : "bg-[#f8f9fc] hover:bg-white border-[#E2E8F0]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-black text-[#191c1e] truncate">
                      {hotspot.location}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${
                        hotspot.status === "CRITICAL"
                          ? "bg-rose-100 text-rose-700"
                          : hotspot.status === "WARNING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {hotspot.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-[#737784] truncate">{hotspot.country}</span>
                    <span className="font-mono font-black text-[#003396]">
                      {hotspot.cases.toLocaleString()} cases
                    </span>
                  </div>

                  <div className="mt-1 pt-1 border-t border-[#E2E8F0]/70 flex items-center justify-between text-[9px] text-[#424752]">
                    <span className="truncate">Disease: {hotspot.disease}</span>
                    <span className="font-semibold text-[#BA1A1A] flex-shrink-0">
                      {hotspot.deaths} deaths
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
