"use client";

import { useState, useMemo } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import { Button, Input, Select, Switch, Badge, cn } from "./ui";
import {
  Satellite,
  Search,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GROUPS = [
  { value: "active", label: "Active Satellites" },
  { value: "stations", label: "Space Stations" },
  { value: "weather", label: "Weather" },
  { value: "starlink", label: "Starlink" },
  { value: "visual", label: "Brightest" },
  { value: "geo-operational", label: "GEO Operational" },
];

export default function LeftRail({
  onGroupChange,
}: {
  onGroupChange: (group: string) => void;
}) {
  const {
    satellites,
    selectedSatId,
    trackedSatIds,
    group,
    renderLimit,
    showTracks,
    showLabels,
    selectSatellite,
    toggleTracked,
    setGroup,
    setRenderLimit,
    setShowTracks,
    setShowLabels,
    loading,
  } = useOrbitStore();

  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [showTrackedList, setShowTrackedList] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return satellites.slice(0, 50);
    const q = query.toLowerCase();
    return satellites
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.noradId.includes(q)
      )
      .slice(0, 50);
  }, [satellites, query]);

  const trackedSats = satellites.filter((s) => trackedSatIds.has(s.noradId));

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute left-4 top-20 bottom-4 z-30 w-72 flex flex-col gap-3"
    >
      {/* Search & Group */}
      <div className="glass rounded-xl p-3 flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <Input
            placeholder="Search satellite..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 pr-3"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Select
          value={group}
          onChange={(g) => {
            setGroup(g);
            onGroupChange(g);
          }}
        >
          {GROUPS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </Select>
        {loading && (
          <p className="text-xs text-blue-400 text-center animate-pulse">
            Loading TLE data…
          </p>
        )}
      </div>

      {/* Satellite List */}
      <div className="glass rounded-xl flex flex-col min-h-0 flex-1">
        <button
          className="flex items-center justify-between px-3 py-2 border-b border-white/5"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-white/40" />
            <span className="text-xs font-medium text-white/70">
              Satellites
            </span>
            <Badge variant="outline" className="text-[10px] py-0">
              {satellites.length}
            </Badge>
          </div>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-white/30" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-white/30" />
          )}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-y-auto min-h-0 max-h-64"
            >
              {filtered.map((sat) => (
                <div
                  key={sat.noradId}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-white/5 transition-colors group",
                    selectedSatId === sat.noradId && "bg-blue-500/10"
                  )}
                  onClick={() =>
                    selectSatellite(
                      selectedSatId === sat.noradId ? null : sat.noradId
                    )
                  }
                >
                  <Satellite
                    className={cn(
                      "w-3 h-3 shrink-0",
                      selectedSatId === sat.noradId
                        ? "text-blue-400"
                        : "text-white/30"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80 truncate">
                      {sat.name}
                    </p>
                    <p className="text-[10px] text-white/30">#{sat.noradId}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTracked(sat.noradId);
                    }}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      trackedSatIds.has(sat.noradId) && "opacity-100"
                    )}
                  >
                    <Star
                      className={cn(
                        "w-3 h-3",
                        trackedSatIds.has(sat.noradId)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-white/30"
                      )}
                    />
                  </button>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-white/30 text-center py-4">
                  No satellites found
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tracked */}
      {trackedSats.length > 0 && (
        <div className="glass rounded-xl p-3">
          <button
            className="flex items-center gap-1.5 mb-2"
            onClick={() => setShowTrackedList(!showTrackedList)}
          >
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-medium text-white/70">
              Tracked ({trackedSats.length})
            </span>
          </button>
          <AnimatePresence>
            {showTrackedList && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                {trackedSats.map((s) => (
                  <div
                    key={s.noradId}
                    className="flex items-center justify-between py-1 text-xs"
                  >
                    <span
                      className="text-white/70 cursor-pointer hover:text-white truncate flex-1"
                      onClick={() => selectSatellite(s.noradId)}
                    >
                      {s.name}
                    </span>
                    <button onClick={() => toggleTracked(s.noradId)}>
                      <X className="w-3 h-3 text-white/30 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* View Controls */}
      <div className="glass rounded-xl p-3 flex flex-col gap-2">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Display
        </p>
        <Switch
          checked={showTracks}
          onChange={setShowTracks}
          label="Orbit tracks"
        />
        <Switch
          checked={showLabels}
          onChange={setShowLabels}
          label="Labels"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Render limit</span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setRenderLimit(Math.max(50, renderLimit - 50))}
              className="w-5 h-5 text-xs"
            >
              -
            </Button>
            <span className="text-xs text-white/80 w-10 text-center">
              {renderLimit}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setRenderLimit(Math.min(2000, renderLimit + 50))}
              className="w-5 h-5 text-xs"
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
