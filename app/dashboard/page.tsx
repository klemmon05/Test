"use client";

import { useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useOrbitStore } from "@/store/useOrbitStore";
import { propagate } from "@/lib/propagation";
import type { SatelliteData } from "@/store/useOrbitStore";
import TopBar from "@/components/TopBar";
import LeftRail from "@/components/LeftRail";
import DetailsSheet from "@/components/DetailsSheet";
import AnalyticsDrawer from "@/components/AnalyticsDrawer";
import TimelineScrubber from "@/components/TimelineScrubber";
import CommandPalette from "@/components/CommandPalette";

const GlobeCesium = dynamic(() => import("@/components/GlobeCesium"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0a1a] flex items-center justify-center">
      <div className="text-white/30 text-sm animate-pulse">
        Loading 3D Globe…
      </div>
    </div>
  ),
});

const Map2D = dynamic(() => import("@/components/Map2D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0a12] flex items-center justify-center">
      <div className="text-white/30 text-sm animate-pulse">
        Loading 2D Map…
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const {
    satellites,
    mapMode,
    timeMode,
    simTime,
    renderLimit,
    group,
    setLoading,
    setError,
    setSatellites,
    setLastUpdated,
    setShowCommandPalette,
    updateSatellitePosition,
  } = useOrbitStore();

  const propagationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTLE = useCallback(
    async (grp = group) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tle?group=${grp}`);
        const data: SatelliteData[] = await res.json();
        setSatellites(data);
        setLastUpdated(Date.now());
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    },
    [group, setLoading, setError, setSatellites, setLastUpdated]
  );

  // Initial fetch
  useEffect(() => {
    fetchTLE();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Propagation loop
  useEffect(() => {
    if (propagationRef.current) clearInterval(propagationRef.current);

    propagationRef.current = setInterval(() => {
      const now = timeMode === "LIVE" ? new Date() : simTime;
      const satsToUpdate = satellites.slice(0, renderLimit);

      satsToUpdate.forEach((sat) => {
        const pos = propagate(sat.line1, sat.line2, now);
        if (pos) {
          updateSatellitePosition(sat.noradId, pos);
        }
      });
    }, 2000);

    return () => {
      if (propagationRef.current) clearInterval(propagationRef.current);
    };
  }, [satellites, timeMode, simTime, renderLimit, updateSatellitePosition]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "/" || (e.key === "k" && e.metaKey)) {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setShowCommandPalette]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        {mapMode === "globe" ? <GlobeCesium /> : <Map2D />}
      </div>

      {/* UI Overlays */}
      <TopBar onFetchTLE={fetchTLE} />
      <LeftRail onGroupChange={fetchTLE} />
      <DetailsSheet />
      <AnalyticsDrawer />
      <TimelineScrubber />
      <CommandPalette />

      {/* Status bar */}
      <div className="absolute bottom-4 right-4 z-20 glass rounded-lg px-3 py-1.5 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[10px] text-white/40 font-mono">
          {timeMode === "LIVE" ? "LIVE" : "SIM"} ·{" "}
          {satellites.filter((s) => s.lat !== undefined).length} tracked
        </span>
      </div>
    </div>
  );
}
