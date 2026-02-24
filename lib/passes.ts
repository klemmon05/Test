import { propagate } from "./propagation";

export interface Pass {
  riseLat: number;
  riseLng: number;
  riseTime: Date;
  maxElevation: number;
  setTime: Date;
  duration: number; // seconds
}

export interface ObserverLocation {
  lat: number;
  lng: number;
  alt: number; // km
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function elevationAngle(
  obsLat: number,
  obsLng: number,
  obsAlt: number,
  satLat: number,
  satLng: number,
  satAlt: number
): number {
  const R = 6371; // Earth radius km
  const dLat = toRad(satLat - obsLat);
  const dLng = toRad(satLng - obsLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(obsLat)) * Math.cos(toRad(satLat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const range = Math.sqrt(
    (R + satAlt) ** 2 + (R + obsAlt) ** 2 - 2 * (R + satAlt) * (R + obsAlt) * Math.cos(c)
  );
  const sinEl =
    ((R + satAlt) * Math.cos(c) - (R + obsAlt)) / range;
  return (Math.asin(sinEl) * 180) / Math.PI;
}

export function predictPasses(
  line1: string,
  line2: string,
  observer: ObserverLocation,
  startTime: Date,
  horizonDays = 1
): Pass[] {
  const passes: Pass[] = [];
  const stepSec = 10;
  const totalSteps = (horizonDays * 24 * 3600) / stepSec;
  const minElevation = 5;

  let inPass = false;
  let riseTime: Date | null = null;
  let riseLat = 0, riseLng = 0;
  let maxEl = 0;

  for (let i = 0; i < totalSteps; i++) {
    const t = new Date(startTime.getTime() + i * stepSec * 1000);
    const pos = propagate(line1, line2, t);
    if (!pos) continue;

    const el = elevationAngle(
      observer.lat, observer.lng, observer.alt,
      pos.lat, pos.lng, pos.alt
    );

    if (!inPass && el >= minElevation) {
      inPass = true;
      riseTime = t;
      riseLat = pos.lat;
      riseLng = pos.lng;
      maxEl = el;
    } else if (inPass && el >= minElevation) {
      if (el > maxEl) maxEl = el;
    } else if (inPass && el < minElevation) {
      inPass = false;
      if (riseTime) {
        const duration = (t.getTime() - riseTime.getTime()) / 1000;
        if (duration > 30) {
          passes.push({
            riseLat,
            riseLng,
            riseTime,
            maxElevation: Math.round(maxEl),
            setTime: t,
            duration: Math.round(duration),
          });
        }
      }
      if (passes.length >= 5) break;
    }
  }

  return passes;
}
