// satellite.js SGP4 propagation helpers
// eslint-disable-next-line @typescript-eslint/no-require-imports
const satellite = require("satellite.js");

export interface SatellitePosition {
  lat: number;
  lng: number;
  alt: number; // km
  velocity: number; // km/s
}

export function propagate(
  line1: string,
  line2: string,
  date: Date
): SatellitePosition | null {
  try {
    const satrec = satellite.twoline2satrec(line1, line2);
    const positionAndVelocity = satellite.propagate(satrec, date);
    const positionEci = positionAndVelocity.position;

    if (!positionEci || typeof positionEci === "boolean") return null;

    const gmst = satellite.gstime(date);
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);

    const lat = satellite.degreesLat(positionGd.latitude);
    const lng = satellite.degreesLong(positionGd.longitude);
    const alt = positionGd.height;

    const velocityEci = positionAndVelocity.velocity;
    let velocity = 0;
    if (velocityEci && typeof velocityEci !== "boolean") {
      velocity = Math.sqrt(
        velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2
      );
    }

    if (isNaN(lat) || isNaN(lng) || isNaN(alt)) return null;

    return { lat, lng, alt, velocity };
  } catch {
    return null;
  }
}

export function propagateOrbitPath(
  line1: string,
  line2: string,
  date: Date,
  steps = 90
): Array<[number, number]> {
  // One full orbit ~90 min; step every minute
  const points: Array<[number, number]> = [];
  try {
    const satrec = satellite.twoline2satrec(line1, line2);
    for (let i = 0; i < steps; i++) {
      const t = new Date(date.getTime() + i * 60 * 1000);
      const pv = satellite.propagate(satrec, t);
      const pos = pv.position;
      if (!pos || typeof pos === "boolean") continue;
      const gmst = satellite.gstime(t);
      const gd = satellite.eciToGeodetic(pos, gmst);
      const lat = satellite.degreesLat(gd.latitude);
      const lng = satellite.degreesLong(gd.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        points.push([lng, lat]);
      }
    }
  } catch {
    // ignore
  }
  return points;
}
