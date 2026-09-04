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
import { fromLonLat, toLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import { Plus, Minus, RotateCcw, MapPin, Calendar, ExternalLink, X } from "lucide-react";
import { PublicHealthEvent } from "@/types/publicHealthEvent";

interface PheMapViewProps {
  events: PublicHealthEvent[];
  selectedEvent: PublicHealthEvent | null;
  onSelectEvent: (event: PublicHealthEvent) => void;
  onOpenResource: (event: PublicHealthEvent) => void;
  heightClass?: string;
}

interface ClusterGroup {
  id: string;
  label: string;
  coordinates: [number, number];
  events: PublicHealthEvent[];
}

export default function PheMapView({
  events,
  selectedEvent,
  onSelectEvent,
  onOpenResource,
  heightClass = "h-[260px]",
}: PheMapViewProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const [popupCluster, setPopupCluster] = useState<ClusterGroup | null>(null);

  // Group events by location proximity (e.g. Manila cluster of 4)
  const clusters: ClusterGroup[] = React.useMemo(() => {
    const groups: ClusterGroup[] = [];
    const PROXIMITY_THRESHOLD = 0.5; // ~50km degree threshold for visual cluster matching screenshot

    events.forEach((event) => {
      // Look for existing group nearby
      const existing = groups.find((g) => {
        const dLon = Math.abs(g.coordinates[0] - event.coordinates[0]);
        const dLat = Math.abs(g.coordinates[1] - event.coordinates[1]);
        return dLon < PROXIMITY_THRESHOLD && dLat < PROXIMITY_THRESHOLD;
      });

      if (existing) {
        existing.events.push(event);
      } else {
        groups.push({
          id: `cluster-${event.id}`,
          label: event.city || event.location,
          coordinates: [...event.coordinates],
          events: [event],
        });
      }
    });

    return groups;
  }, [events]);

  // Initialize Map
  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 10,
    });

    // Clean OpenStreetMap base layer
    const baseLayer = new TileLayer({
      source: new OSM(),
      opacity: 0.9,
    });

    // Centered on ASEAN (coordinates ~112.0, 8.0) to display Indonesia, Philippines, Viet Nam, etc.
    const map = new Map({
      target: mapElementRef.current,
      layers: [baseLayer, vectorLayer],
      view: new View({
        center: fromLonLat([115.0, 7.5]),
        zoom: 4.2,
        minZoom: 3.2,
        maxZoom: 12,
      }),
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
      }),
    });

    mapRef.current = map;

    // Handle Marker Click
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const clusterData = feature.get("clusterData") as ClusterGroup;
        if (clusterData) {
          setPopupCluster(clusterData);
          if (clusterData.events.length === 1) {
            onSelectEvent(clusterData.events[0]);
          } else {
            // Select the first event in the cluster
            onSelectEvent(clusterData.events[0]);
          }
        }
      } else {
        setPopupCluster(null);
      }
    });

    // Cursor pointer on hover
    map.on("pointermove", (e) => {
      const hit = map.hasFeatureAtPixel(e.pixel);
      map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  // Update Vector Features whenever clusters change or selectedEvent changes
  useEffect(() => {
    if (!vectorSourceRef.current) return;
    const source = vectorSourceRef.current;
    source.clear();

    clusters.forEach((cluster) => {
      const isSelected =
        selectedEvent &&
        cluster.events.some((e) => e.id === selectedEvent.id);

      const count = cluster.events.length;
      const isMulti = count > 1;

      const feature = new Feature({
        geometry: new Point(fromLonLat(cluster.coordinates)),
        clusterData: cluster,
      });

      if (isMulti) {
        // Red cluster circle with number, exactly as shown in the screenshot ("4")
        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: isSelected ? 16 : 14,
              fill: new Fill({ color: "#D32F2F" }), // Bright primary red from reference
              stroke: new Stroke({
                color: isSelected ? "#1E3A8A" : "#FFFFFF",
                width: isSelected ? 3 : 2,
              }),
            }),
            text: new Text({
              text: String(count),
              font: "bold 12px 'Inter', sans-serif",
              fill: new Fill({ color: "#FFFFFF" }),
              offsetY: 0.5,
            }),
          })
        );
      } else {
        // Single red dot pin matching reference map
        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: isSelected ? 8 : 6,
              fill: new Fill({ color: "#D32F2F" }),
              stroke: new Stroke({
                color: isSelected ? "#1E3A8A" : "#FFFFFF",
                width: isSelected ? 2.5 : 2,
              }),
            }),
          })
        );
      }

      source.addFeature(feature);
    });
  }, [clusters, selectedEvent]);

  // Center on selected event when changed from external table
  useEffect(() => {
    if (!selectedEvent || !mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      center: fromLonLat(selectedEvent.coordinates),
      duration: 600,
      zoom: Math.max(view.getZoom() || 4.2, 5.5),
    });

    // Also update popup
    const matchingCluster = clusters.find((c) =>
      c.events.some((e) => e.id === selectedEvent.id)
    );
    if (matchingCluster) {
      setPopupCluster(matchingCluster);
    }
  }, [selectedEvent, clusters]);

  // Map Controls
  const handleZoomIn = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ zoom: (view.getZoom() || 4) + 0.8, duration: 250 });
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ zoom: (view.getZoom() || 4) - 0.8, duration: 250 });
  };

  const handleReset = () => {
    if (!mapRef.current) return;
    mapRef.current.getView().animate({
      center: fromLonLat([115.0, 7.5]),
      zoom: 4.2,
      duration: 400,
    });
    setPopupCluster(null);
  };

  return (
    <div className={`relative w-full ${heightClass} bg-slate-100 overflow-hidden rounded-xl border border-slate-200/80 shadow-sm`}>
      {/* Map Container */}
      <div ref={mapElementRef} className="w-full h-full" />

      {/* Top Left Zoom Controls (matching the screenshot) */}
      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-20">
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-300 shadow-md text-slate-800 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 text-slate-700" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-300 shadow-md text-slate-800 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
        >
          <Minus className="w-4 h-4 text-slate-700" />
        </button>
        <button
          onClick={handleReset}
          title="Reset ASEAN View"
          className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-300 shadow-md text-slate-800 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all mt-0.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
        </button>
      </div>

      {/* Top Right Mini Legend */}
      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-sm text-[10px] text-slate-600 flex items-center gap-2 z-20 pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] inline-block"></span>
          Event
        </span>
        <span className="flex items-center gap-1 font-semibold text-slate-800">
          <span className="w-4 h-4 rounded-full bg-[#D32F2F] text-white text-[9px] font-bold flex items-center justify-center">
            4
          </span>
          Cluster
        </span>
      </div>

      {/* Interactive Cluster / Event Popup Overlay */}
      {popupCluster && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-xl z-20 transition-all duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
                {popupCluster.events.length}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {popupCluster.label}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {popupCluster.events[0].country} • {popupCluster.events.length} event{popupCluster.events.length > 1 ? "s" : ""} recorded
                </p>
              </div>
            </div>
            <button
              onClick={() => setPopupCluster(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of events inside this cluster */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {popupCluster.events.map((evt) => {
              const isEvtSelected = selectedEvent?.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className={`p-2 rounded-lg cursor-pointer border text-left transition-colors flex items-start justify-between gap-2 ${
                    isEvtSelected
                      ? "bg-blue-50/90 border-blue-300 text-blue-900"
                      : "bg-slate-50/80 border-slate-200 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold truncate leading-tight">
                      {evt.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {evt.dateFormatted}
                      </span>
                      {evt.disease && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-medium">
                          {evt.disease}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenResource(evt);
                    }}
                    className="shrink-0 px-2 py-1 text-[10px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1 shadow-xs"
                  >
                    Details
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
