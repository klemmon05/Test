"use client";

import { useMemo } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import { Button } from "./ui";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { X, TrendingUp, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyticsDrawer() {
  const { satellites, showAnalytics, setShowAnalytics } = useOrbitStore();

  // Altitude distribution
  const altData = useMemo(() => {
    const buckets: Record<string, number> = {
      "LEO <500": 0,
      "LEO 500-1000": 0,
      "MEO 1000-10000": 0,
      "GEO ~36000": 0,
      "HEO >36000": 0,
    };
    satellites.forEach((s) => {
      if (s.alt === undefined) return;
      if (s.alt < 500) buckets["LEO <500"]++;
      else if (s.alt < 1000) buckets["LEO 500-1000"]++;
      else if (s.alt < 10000) buckets["MEO 1000-10000"]++;
      else if (s.alt < 40000) buckets["GEO ~36000"]++;
      else buckets["HEO >36000"]++;
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [satellites]);

  // Velocity distribution (sample)
  const velocityData = useMemo(() => {
    const positioned = satellites.filter((s) => s.velocity !== undefined);
    const sample = positioned.slice(0, 50);
    return sample.map((s, i) => ({
      idx: i,
      velocity: s.velocity ? Math.round(s.velocity * 10) / 10 : 0,
      name: s.name.slice(0, 8),
    }));
  }, [satellites]);

  // Coverage map data - lat/lng scatter approximation
  const coverageData = useMemo(() => {
    return satellites
      .filter((s) => s.lat !== undefined)
      .slice(0, 100)
      .map((s) => ({
        lat: Math.round((s.lat ?? 0) / 10) * 10,
        count: 1,
      }))
      .reduce((acc: { lat: number; count: number }[], cur) => {
        const existing = acc.find((a) => a.lat === cur.lat);
        if (existing) existing.count++;
        else acc.push({ ...cur });
        return acc;
      }, [])
      .sort((a, b) => a.lat - b.lat);
  }, [satellites]);

  return (
    <AnimatePresence>
      {showAnalytics && (
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100vw-600px)] min-w-[500px] max-w-3xl"
        >
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Analytics</h3>
                <span className="text-xs text-white/40">
                  {satellites.filter((s) => s.lat !== undefined).length} positioned
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAnalytics(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Altitude Distribution */}
              <div>
                <p className="text-xs text-white/50 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Altitude Bands
                </p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={altData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }}
                      tickFormatter={(v) => v.split(" ")[0]}
                    />
                    <YAxis tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,15,25,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Velocity Sample */}
              <div>
                <p className="text-xs text-white/50 mb-2">Velocity (km/s)</p>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={velocityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis hide />
                    <YAxis tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,15,25,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="velocity"
                      stroke="#3b82f6"
                      fill="url(#velGrad)"
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Latitude Coverage */}
              <div>
                <p className="text-xs text-white/50 mb-2">Latitude Coverage</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={coverageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="lat"
                      tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }}
                      tickFormatter={(v) => `${v}°`}
                    />
                    <YAxis tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,15,25,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
