"use client";

import { useEffect, useRef, useCallback } from "react";
import { useOrbitStore } from "@/store/useOrbitStore";

// Canvas-based fallback globe renderer when Cesium fails
function CanvasGlobe({
  satellites,
  selectedSatId,
  showLabels,
  renderLimit,
  onSelectSat,
}: {
  satellites: Array<{
    noradId: string;
    name: string;
    lat?: number;
    lng?: number;
    alt?: number;
  }>;
  selectedSatId: string | null;
  showLabels: boolean;
  renderLimit: number;
  onSelectSat: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animRef = useRef<number>(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.38;

    ctx.clearRect(0, 0, W, H);

    // Space background
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H));
    grad.addColorStop(0, "#0a0a1a");
    grad.addColorStop(1, "#000005");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.save();
    for (let i = 0; i < 200; i++) {
      const sx = (((i * 137.508 * W) % W) + W) % W;
      const sy = (((i * 197.3 * H) % H) + H) % H;
      const alpha = 0.2 + (i % 5) * 0.1;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.5 + (i % 2) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Globe shadow
    const shadowGrad = ctx.createRadialGradient(
      cx + R * 0.3, cy - R * 0.3, 0,
      cx, cy, R * 1.2
    );
    shadowGrad.addColorStop(0, "rgba(0,0,0,0)");
    shadowGrad.addColorStop(1, "rgba(0,0,0,0.6)");

    // Globe base
    const globeGrad = ctx.createRadialGradient(
      cx - R * 0.3, cy - R * 0.3, R * 0.1,
      cx, cy, R
    );
    globeGrad.addColorStop(0, "#1a3a5c");
    globeGrad.addColorStop(0.4, "#0d2137");
    globeGrad.addColorStop(1, "#060e1a");

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = globeGrad;
    ctx.fill();

    // Grid lines
    ctx.save();
    ctx.strokeStyle = "rgba(100,160,220,0.08)";
    ctx.lineWidth = 0.5;
    const rot = rotationRef.current;

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = cy - R * Math.sin((lat * Math.PI) / 180);
      const r = R * Math.cos((lat * Math.PI) / 180);
      if (r <= 0) continue;
      ctx.beginPath();
      ctx.ellipse(cx, y, r, r * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      const angle = ((lng + rot) * Math.PI) / 180;
      const x1 = cx + R * Math.sin(angle);
      const y1 = cy - R * 0.98;
      const x2 = cx + R * Math.sin(angle + Math.PI);
      const y2 = cy + R * 0.98;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cx + R * 1.2 * Math.cos(angle), cy, cx + R * 1.2 * Math.cos(angle), cy, x2, y2);
      ctx.stroke();
    }
    ctx.restore();

    // Atmosphere glow
    const atmoGrad = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.15);
    atmoGrad.addColorStop(0, "rgba(30,100,200,0.0)");
    atmoGrad.addColorStop(0.5, "rgba(30,100,200,0.06)");
    atmoGrad.addColorStop(1, "rgba(30,100,200,0.0)");
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
    ctx.fillStyle = atmoGrad;
    ctx.fill();

    // Globe highlight
    const highlightGrad = ctx.createRadialGradient(
      cx - R * 0.35, cy - R * 0.35, 0,
      cx - R * 0.35, cy - R * 0.35, R * 0.7
    );
    highlightGrad.addColorStop(0, "rgba(255,255,255,0.06)");
    highlightGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = highlightGrad;
    ctx.fill();

    // Shadow overlay
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = shadowGrad;
    ctx.fill();

    // Globe border
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(100,160,220,0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Satellites
    const visible = satellites
      .filter((s) => s.lat !== undefined && s.lng !== undefined)
      .slice(0, renderLimit);

    visible.forEach((sat) => {
      if (sat.lat === undefined || sat.lng === undefined) return;

      const lngRad = ((sat.lng + rot) * Math.PI) / 180;
      const latRad = (sat.lat * Math.PI) / 180;

      // Check if on visible hemisphere
      const cosAngle = Math.sin(latRad) * 0 + Math.cos(latRad) * Math.sin(lngRad);
      if (cosAngle < 0) return; // Behind the globe

      const altScale = 1 + (sat.alt || 0) / 6371;
      const x = cx + R * altScale * Math.cos(latRad) * Math.cos(lngRad);
      const y = cy - R * altScale * Math.sin(latRad);

      const isSelected = sat.noradId === selectedSatId;
      const alt = sat.alt || 0;
      let color = "#3b82f6";
      if (alt > 35000) color = "#f59e0b";
      else if (alt > 1000) color = "#8b5cf6";

      if (isSelected) {
        // Pulsing ring
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}60`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      if (showLabels && isSelected) {
        ctx.font = "10px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillText(sat.name, x + 8, y - 4);
      }
    });

    // Equator label
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(100,160,220,0.3)";
    ctx.fillText("EQ", cx + R + 4, cy + 3);
  }, [satellites, selectedSatId, showLabels, renderLimit]);

  useEffect(() => {
    const animate = () => {
      if (!isDragging.current) {
        rotationRef.current = (rotationRef.current + 0.05) % 360;
      }
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);
    return () => observer.disconnect();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    rotationRef.current += (e.clientX - lastX.current) * 0.3;
    lastX.current = e.clientX;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const R = Math.min(rect.width, rect.height) * 0.38;
    const rot = rotationRef.current;

    let closest: string | null = null;
    let minDist = 20;

    satellites
      .filter((s) => s.lat !== undefined && s.lng !== undefined)
      .slice(0, renderLimit)
      .forEach((sat) => {
        if (sat.lat === undefined || sat.lng === undefined) return;
        const lngRad = ((sat.lng + rot) * Math.PI) / 180;
        const latRad = (sat.lat * Math.PI) / 180;
        const cosAngle = Math.cos(latRad) * Math.sin(lngRad);
        if (cosAngle < 0) return;
        const altScale = 1 + (sat.alt || 0) / 6371;
        const x = cx + R * altScale * Math.cos(latRad) * Math.cos(lngRad);
        const y = cy - R * altScale * Math.sin(latRad);
        const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closest = sat.noradId;
        }
      });

    if (closest) onSelectSat(closest);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      style={{ display: "block" }}
    />
  );
}

export default function GlobeCesium() {
  const { satellites, selectedSatId, showLabels, renderLimit, selectSatellite } =
    useOrbitStore();

  return (
    <div className="w-full h-full bg-[#0a0a1a] flex items-center justify-center">
      <CanvasGlobe
        satellites={satellites}
        selectedSatId={selectedSatId}
        showLabels={showLabels}
        renderLimit={renderLimit}
        onSelectSat={selectSatellite}
      />
    </div>
  );
}
