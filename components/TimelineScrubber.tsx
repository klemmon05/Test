"use client";

import { useOrbitStore } from "@/store/useOrbitStore";
import { Button } from "./ui";
import { Play, Pause, SkipBack, FastForward } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function TimelineScrubber() {
  const { timeMode, simTime, simSpeed, setSimTime, setSimSpeed } =
    useOrbitStore();
  const [playing, setPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timeMode !== "SIM" || !playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSimTime(new Date(simTime.getTime() + simSpeed * 1000));
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeMode, playing, simTime, simSpeed, setSimTime]);

  if (timeMode !== "SIM") return null;

  const speeds = [1, 10, 60, 300, 600];

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 glass rounded-2xl px-4 py-2 flex items-center gap-3"
    >
      <span className="text-xs text-white/40 font-mono">SIM</span>
      <span className="text-xs font-mono text-white">
        {simTime.toUTCString().slice(0, 25)}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSimTime(new Date())}
          title="Reset to now"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <FastForward className="w-3 h-3 text-white/30" />
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setSimSpeed(s)}
            className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
              simSpeed === s
                ? "bg-blue-600 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            {s >= 60 ? `${s / 60}m` : `${s}s`}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
