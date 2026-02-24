import { NextRequest, NextResponse } from "next/server";
import { parseTleText } from "@/lib/tle";
import { SAMPLE_TLES } from "@/lib/sampleTle";

// In-memory cache
const cache: Map<string, { data: unknown; ts: number }> = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const GROUP_URLS: Record<string, string> = {
  active: "https://celestrak.org/SATCAT/GP.php?GROUP=active&FORMAT=tle",
  stations: "https://celestrak.org/SATCAT/GP.php?GROUP=stations&FORMAT=tle",
  weather: "https://celestrak.org/SATCAT/GP.php?GROUP=weather&FORMAT=tle",
  starlink: "https://celestrak.org/SATCAT/GP.php?GROUP=starlink&FORMAT=tle",
  visual: "https://celestrak.org/SATCAT/GP.php?GROUP=visual&FORMAT=tle",
  "geo-operational":
    "https://celestrak.org/SATCAT/GP.php?GROUP=geo-operational&FORMAT=tle",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group") || "active";
  const cacheKey = group;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const url = GROUP_URLS[group] || GROUP_URLS["active"];

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "OrbitWatch/1.0" },
      next: { revalidate: 21600 },
    });

    if (!response.ok) {
      throw new Error(`CelesTrak returned ${response.status}`);
    }

    const text = await response.text();
    const satellites = parseTleText(text);

    if (satellites.length === 0) {
      throw new Error("No TLE data parsed");
    }

    cache.set(cacheKey, { data: satellites, ts: Date.now() });
    return NextResponse.json(satellites);
  } catch (err) {
    console.error("TLE fetch error:", err);
    // Return sample data as fallback
    return NextResponse.json(SAMPLE_TLES, {
      headers: { "X-Fallback": "true" },
    });
  }
}
