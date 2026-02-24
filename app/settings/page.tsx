"use client";

import { useState } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";
import { Button, Input, Switch, Badge } from "@/components/ui";
import { ArrowLeft, MapPin, Gauge, Eye, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SettingsPage() {
  const {
    observerLocation,
    renderLimit,
    showTracks,
    showLabels,
    mapMode,
    setObserverLocation,
    setRenderLimit,
    setShowTracks,
    setShowLabels,
    setMapMode,
  } = useOrbitStore();

  const [lat, setLat] = useState(String(observerLocation.lat));
  const [lng, setLng] = useState(String(observerLocation.lng));
  const [alt, setAlt] = useState(String(observerLocation.alt));
  const [locName, setLocName] = useState(observerLocation.name || "");
  const [saved, setSaved] = useState(false);

  const handleSaveLocation = () => {
    setObserverLocation({
      lat: parseFloat(lat) || 0,
      lng: parseFloat(lng) || 0,
      alt: parseFloat(alt) || 0.01,
      name: locName || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGeoLocate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(4)));
        setLng(String(pos.coords.longitude.toFixed(4)));
        setAlt(String((pos.coords.altitude || 0) / 1000));
      },
      (err) => console.error("Geolocation error:", err)
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-sm text-white/40">OrbitWatch configuration</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Observer Location */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-blue-400" />
              <h2 className="font-semibold">Observer Location</h2>
              <Badge variant="outline" className="ml-auto">
                Used for pass predictions
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">
                  Location Name
                </label>
                <Input
                  placeholder="e.g. New York"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">
                  Altitude (km)
                </label>
                <Input
                  type="number"
                  placeholder="0.01"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">
                  Latitude (°)
                </label>
                <Input
                  type="number"
                  placeholder="40.7128"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">
                  Longitude (°)
                </label>
                <Input
                  type="number"
                  placeholder="-74.006"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleGeoLocate}>
                <MapPin className="w-3.5 h-3.5" />
                Use My Location
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveLocation}
                className="ml-auto"
              >
                {saved ? "✓ Saved" : "Save Location"}
              </Button>
            </div>
          </div>

          {/* Display Settings */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-green-400" />
              <h2 className="font-semibold">Display</h2>
            </div>
            <div className="space-y-4">
              <Switch
                checked={showTracks}
                onChange={setShowTracks}
                label="Show orbit tracks"
              />
              <Switch
                checked={showLabels}
                onChange={setShowLabels}
                label="Show satellite labels"
              />
              <div>
                <label className="text-xs text-white/50 mb-2 block">
                  Default view mode
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={mapMode === "globe" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMapMode("globe")}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    3D Globe
                  </Button>
                  <Button
                    variant={mapMode === "map2d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMapMode("map2d")}
                  >
                    2D Map
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4 text-yellow-400" />
              <h2 className="font-semibold">Performance</h2>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">
                Render limit: <span className="text-white">{renderLimit}</span> satellites
              </label>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={renderLimit}
                onChange={(e) => setRenderLimit(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>50</span>
                <span>2000</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold mb-2">About OrbitWatch</h2>
            <p className="text-sm text-white/50 leading-relaxed">
              OrbitWatch is a real-time satellite tracking application using
              SGP4 propagation from CelesTrak TLE data. Built with Next.js 14,
              satellite.js, and MapLibre GL.
            </p>
            <div className="mt-3 flex gap-2">
              <Badge variant="outline">Next.js 14</Badge>
              <Badge variant="outline">satellite.js</Badge>
              <Badge variant="outline">MapLibre GL</Badge>
              <Badge variant="outline">Zustand</Badge>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
