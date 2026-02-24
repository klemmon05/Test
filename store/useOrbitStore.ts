"use client";
import { create } from "zustand";
import type { TleSatellite } from "@/lib/sampleTle";

export type MapMode = "globe" | "map2d";
export type TimeMode = "LIVE" | "SIM";

export interface ObserverLocation {
  lat: number;
  lng: number;
  alt: number;
  name?: string;
}

export interface SatelliteData extends TleSatellite {
  lat?: number;
  lng?: number;
  alt?: number;
  velocity?: number;
  lastUpdated?: number;
}

export interface OrbitState {
  // Data
  satellites: SatelliteData[];
  selectedSatId: string | null;
  trackedSatIds: Set<string>;

  // Observer
  observerLocation: ObserverLocation;

  // Time
  timeMode: TimeMode;
  simTime: Date;
  simSpeed: number;

  // View
  mapMode: MapMode;
  showTracks: boolean;
  showLabels: boolean;
  renderLimit: number;

  // Catalog
  group: string;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;

  // UI
  showAnalytics: boolean;
  showDetails: boolean;
  showCommandPalette: boolean;

  // Actions
  setSatellites: (sats: SatelliteData[]) => void;
  updateSatellitePosition: (
    noradId: string,
    pos: { lat: number; lng: number; alt: number; velocity: number }
  ) => void;
  selectSatellite: (id: string | null) => void;
  toggleTracked: (id: string) => void;
  setObserverLocation: (loc: ObserverLocation) => void;
  setTimeMode: (mode: TimeMode) => void;
  setSimTime: (t: Date) => void;
  setSimSpeed: (s: number) => void;
  setMapMode: (mode: MapMode) => void;
  setShowTracks: (v: boolean) => void;
  setShowLabels: (v: boolean) => void;
  setRenderLimit: (n: number) => void;
  setGroup: (g: string) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setLastUpdated: (t: number) => void;
  setShowAnalytics: (v: boolean) => void;
  setShowDetails: (v: boolean) => void;
  setShowCommandPalette: (v: boolean) => void;
}

export const useOrbitStore = create<OrbitState>((set) => ({
  satellites: [],
  selectedSatId: null,
  trackedSatIds: new Set(),
  observerLocation: { lat: 40.7128, lng: -74.006, alt: 0.01, name: "New York" },
  timeMode: "LIVE",
  simTime: new Date(),
  simSpeed: 1,
  mapMode: "globe",
  showTracks: true,
  showLabels: true,
  renderLimit: 500,
  group: "active",
  loading: false,
  error: null,
  lastUpdated: null,
  showAnalytics: false,
  showDetails: false,
  showCommandPalette: false,

  setSatellites: (sats) => set({ satellites: sats }),
  updateSatellitePosition: (noradId, pos) =>
    set((state) => ({
      satellites: state.satellites.map((s) =>
        s.noradId === noradId ? { ...s, ...pos, lastUpdated: Date.now() } : s
      ),
    })),
  selectSatellite: (id) =>
    set({ selectedSatId: id, showDetails: id !== null }),
  toggleTracked: (id) =>
    set((state) => {
      const next = new Set(state.trackedSatIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { trackedSatIds: next };
    }),
  setObserverLocation: (loc) => set({ observerLocation: loc }),
  setTimeMode: (mode) => set({ timeMode: mode }),
  setSimTime: (t) => set({ simTime: t }),
  setSimSpeed: (s) => set({ simSpeed: s }),
  setMapMode: (mode) => set({ mapMode: mode }),
  setShowTracks: (v) => set({ showTracks: v }),
  setShowLabels: (v) => set({ showLabels: v }),
  setRenderLimit: (n) => set({ renderLimit: n }),
  setGroup: (g) => set({ group: g }),
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),
  setLastUpdated: (t) => set({ lastUpdated: t }),
  setShowAnalytics: (v) => set({ showAnalytics: v }),
  setShowDetails: (v) => set({ showDetails: v }),
  setShowCommandPalette: (v) => set({ showCommandPalette: v }),
}));
