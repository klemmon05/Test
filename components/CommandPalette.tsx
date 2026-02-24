"use client";

import { useState, useMemo, useEffect } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import { Search, Satellite, Globe, Map, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandPalette() {
  const {
    satellites,
    showCommandPalette,
    setShowCommandPalette,
    selectSatellite,
    setMapMode,
    setTimeMode,
  } = useOrbitStore();

  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();

    const satMatches = satellites
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.noradId.includes(q)
      )
      .slice(0, 8)
      .map((s) => ({
        type: "satellite" as const,
        id: s.noradId,
        label: s.name,
        sub: `#${s.noradId}`,
        icon: <Satellite className="w-4 h-4 text-blue-400" />,
        action: () => {
          selectSatellite(s.noradId);
          setShowCommandPalette(false);
          setQuery("");
        },
      }));

    const commands = [
      {
        type: "command" as const,
        id: "globe",
        label: "Switch to 3D Globe",
        sub: "view",
        icon: <Globe className="w-4 h-4 text-purple-400" />,
        action: () => {
          setMapMode("globe");
          setShowCommandPalette(false);
          setQuery("");
        },
      },
      {
        type: "command" as const,
        id: "map2d",
        label: "Switch to 2D Map",
        sub: "view",
        icon: <Map className="w-4 h-4 text-green-400" />,
        action: () => {
          setMapMode("map2d");
          setShowCommandPalette(false);
          setQuery("");
        },
      },
      {
        type: "command" as const,
        id: "sim",
        label: "Enter Simulation Mode",
        sub: "time",
        icon: <Clock className="w-4 h-4 text-yellow-400" />,
        action: () => {
          setTimeMode("SIM");
          setShowCommandPalette(false);
          setQuery("");
        },
      },
    ].filter(
      (c) => !query || c.label.toLowerCase().includes(q)
    );

    return [...satMatches, ...commands].slice(0, 10);
  }, [query, satellites, selectSatellite, setShowCommandPalette, setMapMode, setTimeMode]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCommandPalette(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setShowCommandPalette]);

  return (
    <AnimatePresence>
      {showCommandPalette && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowCommandPalette(false);
              setQuery("");
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  autoFocus
                  placeholder="Search satellites, switch views…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-4 text-white placeholder-white/30 focus:outline-none text-sm"
                />
              </div>

              {results.length > 0 && (
                <div className="border-t border-white/5 max-h-72 overflow-y-auto">
                  {results.map((r) => (
                    <button
                      key={r.id}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors"
                      onClick={r.action}
                    >
                      {r.icon}
                      <div>
                        <p className="text-sm text-white">{r.label}</p>
                        <p className="text-xs text-white/40">{r.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query && results.length === 0 && (
                <div className="border-t border-white/5 px-4 py-6 text-center">
                  <p className="text-sm text-white/30">No results for &quot;{query}&quot;</p>
                </div>
              )}

              <div className="border-t border-white/5 px-4 py-2 flex items-center gap-4">
                <span className="text-[10px] text-white/25">
                  ↑↓ navigate · ↵ select · esc close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
