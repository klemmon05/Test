"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Badge, Button, Tooltip } from "./ui";
import {
  Satellite,
  Settings,
  Search,
  Activity,
  Globe,
  Map,
  Clock,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TopBar({
  onFetchTLE,
}: {
  onFetchTLE: () => void;
}) {
  const {
    satellites,
    trackedSatIds,
    loading,
    lastUpdated,
    timeMode,
    mapMode,
    setTimeMode,
    setMapMode,
    setShowCommandPalette,
    showAnalytics,
    setShowAnalytics,
  } = useOrbitStore();

  const activeSats = satellites.filter((s) => s.lat !== undefined).length;

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 glass rounded-2xl px-4 py-2 shadow-2xl"
    >
      {/* Logo */}
      <div className="flex items-center gap-1.5 mr-2">
        <Satellite className="w-4 h-4 text-blue-400" />
        <span className="font-semibold text-sm text-white">OrbitWatch</span>
      </div>

      <div className="w-px h-5 bg-white/10" />

      {/* KPI Chips */}
      <div className="flex items-center gap-2">
        <Tooltip content="Active satellites tracked">
          <Badge variant="default" className="cursor-default">
            <Activity className="w-3 h-3 mr-1" />
            {activeSats.toLocaleString()} active
          </Badge>
        </Tooltip>
        <Tooltip content="Tracked satellites">
          <Badge variant="outline" className="cursor-default">
            {trackedSatIds.size} tracked
          </Badge>
        </Tooltip>
        {lastUpdated && (
          <Tooltip content="Last TLE update">
            <Badge variant="outline" className="cursor-default text-white/40">
              {new Date(lastUpdated).toLocaleTimeString()}
            </Badge>
          </Tooltip>
        )}
      </div>

      <div className="w-px h-5 bg-white/10" />

      {/* Map Mode Toggle */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
        <Button
          variant={mapMode === "globe" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMapMode("globe")}
          className="rounded-md px-2 py-1"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="text-xs">3D</span>
        </Button>
        <Button
          variant={mapMode === "map2d" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMapMode("map2d")}
          className="rounded-md px-2 py-1"
        >
          <Map className="w-3.5 h-3.5" />
          <span className="text-xs">2D</span>
        </Button>
      </div>

      {/* Time Mode Toggle */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
        <Button
          variant={timeMode === "LIVE" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTimeMode("LIVE")}
          className="rounded-md px-2 py-1"
        >
          <span className="text-xs">LIVE</span>
        </Button>
        <Button
          variant={timeMode === "SIM" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTimeMode("SIM")}
          className="rounded-md px-2 py-1"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">SIM</span>
        </Button>
      </div>

      <div className="w-px h-5 bg-white/10" />

      {/* Actions */}
      <Tooltip content="Search satellites (/)">
        <Button variant="ghost" size="icon" onClick={() => setShowCommandPalette(true)}>
          <Search className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Analytics">
        <Button
          variant={showAnalytics ? "default" : "ghost"}
          size="icon"
          onClick={() => setShowAnalytics(!showAnalytics)}
        >
          <Activity className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Refresh TLE data">
        <Button
          variant="ghost"
          size="icon"
          onClick={onFetchTLE}
          disabled={loading}
          className={loading ? "animate-spin" : ""}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Settings">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (window.location.href = "/settings")}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </Tooltip>
    </motion.div>
  );
}
