"use client";

import { useMemo, useState, useEffect } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import { predictPasses } from "@/lib/passes";
import { formatDuration } from "@/lib/geo";
import { Badge, Button, cn } from "./ui";
import {
  X,
  Star,
  MapPin,
  Navigation,
  TrendingUp,
  Clock,
  Satellite,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DetailsSheet() {
  const {
    satellites,
    selectedSatId,
    trackedSatIds,
    observerLocation,
    showDetails,
    selectSatellite,
    toggleTracked,
    setShowDetails,
  } = useOrbitStore();

  const sat = useMemo(
    () => satellites.find((s) => s.noradId === selectedSatId),
    [satellites, selectedSatId]
  );

  const [passes, setPasses] = useState<
    { riseTime: Date; maxElevation: number; duration: number; setTime: Date }[]
  >([]);
  const [loadingPasses, setLoadingPasses] = useState(false);

  useEffect(() => {
    if (!sat) {
      setPasses([]);
      return;
    }
    setLoadingPasses(true);
    const timer = setTimeout(() => {
      try {
        const result = predictPasses(
          sat.line1,
          sat.line2,
          {
            lat: observerLocation.lat,
            lng: observerLocation.lng,
            alt: observerLocation.alt,
          },
          new Date(),
          1
        );
        setPasses(result);
      } catch {
        setPasses([]);
      } finally {
        setLoadingPasses(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [sat, observerLocation]);

  return (
    <AnimatePresence>
      {showDetails && sat && (
        <motion.div
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-4 top-20 bottom-4 z-30 w-80 flex flex-col gap-3"
        >
          {/* Header */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Satellite className="w-4 h-4 text-blue-400 shrink-0" />
                  <h2 className="text-sm font-semibold text-white truncate">
                    {sat.name}
                  </h2>
                </div>
                <p className="text-xs text-white/40">NORAD #{sat.noradId}</p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => toggleTracked(sat.noradId)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Star
                    className={cn(
                      "w-4 h-4",
                      trackedSatIds.has(sat.noradId)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-white/40"
                    )}
                  />
                </button>
                <button
                  onClick={() => {
                    selectSatellite(null);
                    setShowDetails(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-white/40 mb-1">Latitude</p>
                <p className="text-sm font-mono text-white">
                  {sat.lat !== undefined ? `${sat.lat.toFixed(2)}°` : "—"}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-white/40 mb-1">Longitude</p>
                <p className="text-sm font-mono text-white">
                  {sat.lng !== undefined ? `${sat.lng.toFixed(2)}°` : "—"}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-white/40 mb-1">Altitude</p>
                <p className="text-sm font-mono text-white">
                  {sat.alt !== undefined ? `${Math.round(sat.alt)} km` : "—"}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-white/40 mb-1">Velocity</p>
                <p className="text-sm font-mono text-white">
                  {sat.velocity !== undefined
                    ? `${sat.velocity.toFixed(1)} km/s`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* TLE Info */}
          <div className="glass rounded-xl p-4">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
              TLE Data
            </p>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-white/50 break-all leading-relaxed">
                {sat.line1}
              </p>
              <p className="text-[10px] font-mono text-white/50 break-all leading-relaxed">
                {sat.line2}
              </p>
            </div>
          </div>

          {/* Pass Predictions */}
          <div className="glass rounded-xl p-4 flex-1 overflow-y-auto">
            <div className="flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5 text-white/40" />
              <p className="text-xs font-medium text-white/70">
                Next Passes
              </p>
              <Badge variant="outline" className="text-[10px] py-0 ml-auto">
                from {observerLocation.name || "observer"}
              </Badge>
            </div>

            {loadingPasses ? (
              <div className="text-xs text-white/30 text-center py-4 animate-pulse">
                Calculating passes…
              </div>
            ) : passes.length === 0 ? (
              <div className="text-xs text-white/30 text-center py-4">
                No visible passes in next 24h
              </div>
            ) : (
              <div className="space-y-2">
                {passes.map((pass, i) => (
                  <div
                    key={i}
                    className="bg-white/5 rounded-lg p-2.5 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-white/80">
                          {pass.riseTime.toLocaleTimeString()}
                        </span>
                      </div>
                      <Badge
                        variant={
                          pass.maxElevation > 60
                            ? "success"
                            : pass.maxElevation > 30
                            ? "warning"
                            : "outline"
                        }
                        className="text-[10px] py-0"
                      >
                        {pass.maxElevation}° max el
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDuration(pass.duration)}
                      </span>
                      <span>sets {pass.setTime.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="glass rounded-xl p-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                window.open(
                  `https://www.n2yo.com/satellite/?s=${sat.noradId}`,
                  "_blank"
                )
              }
            >
              <Maximize2 className="w-3.5 h-3.5" />
              N2YO
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const url = `/sat/${sat.noradId}`;
                window.history.pushState({}, "", url);
              }}
            >
              <Navigation className="w-3.5 h-3.5" />
              Deep link
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${sat.lat},${sat.lng}`,
                  "_blank"
                )
              }
            >
              <MapPin className="w-3.5 h-3.5" />
              Map
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
