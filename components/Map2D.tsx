"use client";

import { useEffect, useRef, useCallback } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";

// Store the maplibregl module reference after dynamic import
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let maplibreglModule: any = null;

export default function Map2D() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const { satellites, selectedSatId, showLabels, renderLimit, selectSatellite } =
    useOrbitStore();

  const getColorForAlt = (alt?: number): string => {
    if (alt === undefined) return "#6b7280";
    if (alt < 1000) return "#3b82f6";
    if (alt < 10000) return "#8b5cf6";
    return "#f59e0b";
  };

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;
    try {
      const ml = (await import("maplibre-gl")).default;
      // Load CSS via link element to avoid TypeScript module error
      if (!document.querySelector('link[href*="maplibre-gl"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/maplibre-gl@3/dist/maplibre-gl.css";
        document.head.appendChild(link);
      }
      maplibreglModule = ml;

      const styleUrl =
        process.env.NEXT_PUBLIC_MAPLIBRE_STYLE_URL ||
        "https://demotiles.maplibre.org/style.json";

      const map = new ml.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [0, 0],
        zoom: 1.5,
        attributionControl: false,
      });

      map.on("load", () => {
        mapRef.current = map;
      });
    } catch (err) {
      console.error("MapLibre init error:", err);
    }
  }, []);

  useEffect(() => {
    initMap();
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [initMap]);

  // Update satellite markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded() || !maplibreglModule) return;

    const visible = satellites
      .filter((s) => s.lat !== undefined && s.lng !== undefined)
      .slice(0, renderLimit);
    const visibleIds = new Set(visible.map((s) => s.noradId));

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    visible.forEach((sat) => {
      if (sat.lat === undefined || sat.lng === undefined) return;

      const existing = markersRef.current.get(sat.noradId);
      const color = getColorForAlt(sat.alt);
      const isSelected = sat.noradId === selectedSatId;

      if (existing) {
        existing.setLngLat([sat.lng, sat.lat]);
        return;
      }

      // Create DOM element for marker
      const el = document.createElement("div");
      el.className = "sat-marker";
      el.style.cssText = `
        width: ${isSelected ? 10 : 6}px;
        height: ${isSelected ? 10 : 6}px;
        border-radius: 50%;
        background: ${color};
        border: ${isSelected ? "2px solid white" : "none"};
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 0 ${isSelected ? 8 : 4}px ${color}80;
      `;

      if (showLabels) {
        const label = document.createElement("div");
        label.style.cssText = `
          position: absolute;
          left: 8px;
          top: -6px;
          font-size: 9px;
          color: rgba(255,255,255,0.7);
          white-space: nowrap;
          font-family: monospace;
          pointer-events: none;
        `;
        label.textContent = sat.name.slice(0, 12);
        el.appendChild(label);
      }

      el.addEventListener("click", () => selectSatellite(sat.noradId));

      const marker = new maplibreglModule.Marker({ element: el })
        .setLngLat([sat.lng, sat.lat])
        .addTo(map);
      markersRef.current.set(sat.noradId, marker);
    });
  }, [satellites, selectedSatId, showLabels, renderLimit, selectSatellite]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      <style>{`
        .maplibregl-canvas { outline: none; }
        .maplibregl-canvas-container { width: 100%; height: 100%; }
      `}</style>
    </div>
  );
}
