"use client";

import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Fill, Stroke, Text, Circle as CircleStyle } from "ol/style";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import { MapPin, Plus, Minus, RotateCcw } from "lucide-react";
import { OutbreakSignal } from "@/types/surveillance";

// ASEAN Center Coordinates (approx 115°E, 4°N)
const ASEAN_CENTER_LON_LAT = [115.0, 4.0];
const DEFAULT_ZOOM = 4.3;

// Extent bounding box for ASEAN Region
const ASEAN_EXTENT = [
  ...fromLonLat([90.0, -12.0]),
  ...fromLonLat([143.0, 29.0]),
];

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

  // States
  const [isWindActive] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [, setGfsStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [, setGfsInfo] = useState<string>("Memuat data angin GFS...");

  // Grid Data Reference
  const gfsGridRef = useRef<GfsGridData | null>(null);

  // 1. Fetch Real GFS Wind Data from https://opsroom.sipongidata.my.id/api/gfs (via API proxy)
  useEffect(() => {
    let isMounted = true;

    async function loadGfsData() {
      try {
        setGfsStatus("loading");
        setGfsInfo("Menghubungkan ke https://opsroom.sipongidata.my.id/api/gfs...");

        const res = await fetch("/mobile/api/gfs");
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        if (!Array.isArray(data) || data.length < 2) {
          throw new Error("Invalid GFS payload format");
        }

        // Find U and V components in array
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

          setGfsStatus("ready");
          setGfsInfo("Data GFS Sipongi Aktif (Grid 1°x1° Global GFS)");
        }
      } catch (err) {
        console.warn("GFS API fetch notice, using atmospheric model fallback:", err);
        if (isMounted) {
          setGfsStatus("fallback");
          setGfsInfo("Model Angin Atmosferik Regional Aktif");
        }
      }
    }

    loadGfsData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize OpenLayers Map with ASEAN Countries Vector Layer and Outbreak Points
  useEffect(() => {
    if (!mapElementRef.current) return;

    // Load ASEAN Countries GeoJSON
    const vectorSource = new VectorSource({
      url: "/mobile/assets/data/asean_countries.geojson",
      format: new GeoJSON(),
    });

    // Style matching reference design (soft peach/pink fill, clean borders, country labels)
    const aseanStyleFunction = (feature: unknown) => {
      const f = feature as { get: (k: string) => string | undefined };
      const countryName =
        f.get("ADMIN") ||
        f.get("name") ||
        f.get("NAME") ||
        "";

      return new Style({
        fill: new Fill({
          color: "rgba(240, 215, 218, 0.95)", // Soft peach/pink landmass
        }),
        stroke: new Stroke({
          color: "#424752",
          width: 1.2,
        }),
        text: new Text({
          text: countryName,
          font: "bold 10px 'Public Sans', sans-serif",
          fill: new Fill({ color: "#003396" }),
          stroke: new Stroke({ color: "#FFFFFF", width: 2.5 }),
          offsetY: 0,
          overflow: false,
        }),
      });
    };

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: aseanStyleFunction,
    });

    // Disease Outbreak Location Points (Matching Reference Screenshot)
    const outbreakLocations = [
      // Philippines (NCR, Cebu, Davao, Quezon City, Iloilo, etc.)
      { name: "Manila, Philippines", coord: [120.9842, 14.5995], type: "red" },
      { name: "Quezon City, Philippines", coord: [121.0437, 14.6760], type: "red" },
      { name: "Cebu, Philippines", coord: [123.8854, 10.3157], type: "red" },
      { name: "Iloilo, Philippines", coord: [122.5621, 10.7202], type: "red" },
      { name: "Davao, Philippines", coord: [125.6128, 7.1907], type: "red" },
      { name: "Zamboanga, Philippines", coord: [122.0790, 6.9214], type: "red" },
      { name: "Cagayan de Oro, Philippines", coord: [124.6472, 8.4822], type: "red" },
      { name: "Baguio, Philippines", coord: [120.5960, 16.4023], type: "red" },
      { name: "Batangas, Philippines", coord: [121.0583, 13.7565], type: "red" },
      // Indonesia (Java, Sumatra, Sulawesi, Bali, Kalimantan)
      { name: "Jakarta, Indonesia", coord: [106.8456, -6.2088], type: "blue" },
      { name: "Bandung, Indonesia", coord: [107.6191, -6.9175], type: "red" },
      { name: "Semarang, Indonesia", coord: [110.4208, -6.9932], type: "red" },
      { name: "Surabaya, Indonesia", coord: [112.7521, -7.2575], type: "red" },
      { name: "Yogyakarta, Indonesia", coord: [110.3695, -7.7956], type: "red" },
      { name: "Denpasar, Bali", coord: [115.2167, -8.6500], type: "red" },
      { name: "Mataram, Lombok", coord: [116.1167, -8.5833], type: "red" },
      { name: "Kupang, NTT", coord: [123.6000, -10.1667], type: "red" },
      { name: "Medan, Indonesia", coord: [98.6722, 3.5952], type: "red" },
      { name: "Palembang, Indonesia", coord: [104.7565, -2.9909], type: "red" },
      { name: "Batam, Indonesia", coord: [104.0305, 1.0456], type: "red" },
      { name: "Pekanbaru, Indonesia", coord: [101.4478, 0.5071], type: "red" },
      { name: "Bandar Lampung, Indonesia", coord: [105.2667, -5.4500], type: "red" },
      { name: "Makassar, Indonesia", coord: [119.4327, -5.1477], type: "red" },
      { name: "Palu, Indonesia", coord: [119.8707, -0.8917], type: "red" },
      { name: "Kendari, Indonesia", coord: [122.5126, -3.9985], type: "red" },
      { name: "Manado, Indonesia", coord: [124.8421, 1.4748], type: "red" },
      { name: "Banjarmasin, Indonesia", coord: [114.5901, -3.3194], type: "red" },
      { name: "Balikpapan, Indonesia", coord: [116.8289, -1.2379], type: "red" },
      { name: "Pontianak, Indonesia", coord: [109.3425, -0.0263], type: "red" },
      // Singapore & Malaysia
      { name: "Singapore, Singapore", coord: [103.8198, 1.3521], type: "red" },
      { name: "Kuala Lumpur, Malaysia", coord: [101.6869, 3.1390], type: "red" },
      { name: "Penang, Malaysia", coord: [100.3327, 5.4164], type: "red" },
      { name: "Johor Bahru, Malaysia", coord: [103.7618, 1.4927], type: "red" },
      { name: "Kota Kinabalu, Malaysia", coord: [116.0753, 5.9804], type: "red" },
      { name: "Kuching, Malaysia", coord: [110.3592, 1.5533], type: "red" },
      // Thailand
      { name: "Bangkok, Thailand", coord: [100.5018, 13.7563], type: "red" },
      { name: "Chiang Mai, Thailand", coord: [98.9817, 18.7883], type: "red" },
      { name: "Hat Yai, Thailand", coord: [100.4747, 7.0084], type: "red" },
      { name: "Phuket, Thailand", coord: [98.3923, 7.8804], type: "red" },
      // Laos, Cambodia, Vietnam, Myanmar, Brunei
      { name: "Vientiane, Laos", coord: [102.6331, 17.9757], type: "blue" },
      { name: "Phnom Penh, Cambodia", coord: [104.9282, 11.5564], type: "red" },
      { name: "Siem Reap, Cambodia", coord: [103.8564, 13.3671], type: "red" },
      { name: "Hanoi, Vietnam", coord: [105.8544, 21.0285], type: "red" },
      { name: "Da Nang, Vietnam", coord: [108.2022, 16.0544], type: "red" },
      { name: "Ho Chi Minh City, Vietnam", coord: [106.6297, 10.8231], type: "red" },
      { name: "Can Tho, Vietnam", coord: [105.7844, 10.0452], type: "red" },
      { name: "Yangon, Myanmar", coord: [96.1951, 16.8661], type: "red" },
      { name: "Mandalay, Myanmar", coord: [96.0891, 21.9588], type: "red" },
      { name: "Bandar Seri Begawan, Brunei", coord: [114.9481, 4.9031], type: "red" },
    ];

    const outbreakFeatures = outbreakLocations.map((loc) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(loc.coord)),
        name: loc.name,
        type: loc.type,
      });

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 5.5,
            fill: new Fill({
              color: loc.type === "blue" ? "#003396" : "#BA1A1A",
            }),
            stroke: new Stroke({
              color: "#FFFFFF",
              width: 2,
            }),
          }),
        })
      );

      return feature;
    });

    const outbreakLayer = new VectorLayer({
      source: new VectorSource({
        features: outbreakFeatures,
      }),
      zIndex: 15,
    });

    const view = new View({
      center: fromLonLat(ASEAN_CENTER_LON_LAT),
      zoom: DEFAULT_ZOOM,
      minZoom: 3.4,
      maxZoom: 10,
      extent: ASEAN_EXTENT,
      rotation: 0,
      enableRotation: true,
    });

    const map = new Map({
      target: mapElementRef.current,
      layers: [vectorLayer, outbreakLayer],
      view: view,
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
      }),
    });

    mapRef.current = map;

    // Handle country tap
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const name =
          (feature as { get: (k: string) => string | undefined }).get("ADMIN") ||
          (feature as { get: (k: string) => string | undefined }).get("name") ||
          (feature as { get: (k: string) => string | undefined }).get("NAME");
        setSelectedCountry(name || "Negara Anggota ASEAN");
      } else {
        setSelectedCountry(null);
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // 3. Bilinear Interpolation & Particle Flow Animation using GFS Grid
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

  // OpenLayers Map Controls
  const handleZoomIn = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      zoom: (view.getZoom() || DEFAULT_ZOOM) + 0.5,
      duration: 250,
    });
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      zoom: (view.getZoom() || DEFAULT_ZOOM) - 0.5,
      duration: 250,
    });
  };

  const handleResetAseanView = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      center: fromLonLat(ASEAN_CENTER_LON_LAT),
      zoom: DEFAULT_ZOOM,
      rotation: 0,
      duration: 350,
    });
  };

  return (
    <div className="space-y-3.5 pb-4 animate-in fade-in duration-300">
      
      {/* 1. Header Info Card (SPATIAL DISTRIBUTION OF DISEASE OUTBREAK) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-2">
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#003396] tracking-tight uppercase">
            SPATIAL DISTRIBUTION OF DISEASE OUTBREAK
          </h2>
          <p className="text-[11px] sm:text-xs font-medium text-[#5c6068] mt-1 leading-snug">
            This mapping presents geographic distribution of cases, deaths, and alert status in Southeast Asia.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f5ff] border border-[#d8e2ff] text-[10.5px] font-bold text-[#003396]">
          <MapPin className="w-3.5 h-3.5 text-[#003396]" />
          <span>Region: ASEAN • 100 locations detected</span>
        </div>
      </div>

      {/* Card Peta Arah Angin GFS Kawasan ASEAN - TEMPORARILY HIDDEN */}
      {/*
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm flex items-center justify-between">
        ...
      </div>
      */}

      {/* 2. Main OpenLayers Map Container (Only ASEAN Region) */}
      <div className="relative w-full h-[470px] sm:h-[530px] bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-md">
        
        {/* OpenLayers Map Canvas Container */}
        <div
          ref={mapElementRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        />

        {/* OpenLayers Synchronized GFS Wind Particle Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
        />

        {/* Selected Country Badge (When tapped) */}
        {selectedCountry && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1 bg-[#003396] text-white text-[11px] font-bold rounded-xl shadow-md border border-[#C1A74F]">
              Negara: {selectedCountry}
            </div>
          </div>
        )}

        {/* Top-Left: OpenLayers Zoom Controls (Matching Screenshot) */}
        <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1 pointer-events-auto select-none">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-md hover:bg-white text-[#191c1e] font-extrabold shadow-sm border border-[#E2E8F0] flex items-center justify-center transition-transform active:scale-95"
            title="Perbesar Peta (Zoom In)"
            aria-label="Zoom In"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-md hover:bg-white text-[#191c1e] font-extrabold shadow-sm border border-[#E2E8F0] flex items-center justify-center transition-transform active:scale-95"
            title="Perkecil Peta (Zoom Out)"
            aria-label="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Bottom-Right: Reset ASEAN View Control */}
        <div className="absolute bottom-3.5 right-3.5 z-20 pointer-events-auto select-none">
          <button
            type="button"
            onClick={handleResetAseanView}
            className="w-8 h-8 rounded-xl bg-[#003396] text-white hover:bg-[#002266] font-bold shadow-md border border-[#C1A74F]/50 flex items-center justify-center transition-transform active:scale-90"
            title="Pusatkan ke Kawasan ASEAN"
            aria-label="Reset ASEAN View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
