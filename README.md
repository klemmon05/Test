# 🛰️ OrbitWatch

Real-time satellite tracking web application with 3D globe and 2D map views.

## Features

- **Real-time tracking** – SGP4 propagation using satellite.js with CelesTrak TLE data
- **3D Globe** – Interactive canvas-based globe renderer with satellite positions
- **2D Map** – MapLibre GL flat map view
- **Pass Predictions** – Calculate next visible passes from your observer location
- **Analytics** – Altitude distribution, velocity, and latitude coverage charts
- **Simulation Mode** – Time-travel with adjustable playback speed
- **Command Palette** – Press `/` or `⌘K` to search satellites and switch modes
- **Dark theme** – Space-inspired UI with glassmorphism panels

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS** + custom glassmorphism UI
- **satellite.js** for SGP4 orbit propagation
- **MapLibre GL** for 2D map rendering
- **Zustand** for state management
- **Zod** for TLE validation
- **Framer Motion** for animations
- **Recharts** for analytics charts
- **Playwright** for E2E tests

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone <repo>
cd orbitwatch
npm install
```

### Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Optional environment variables:
- `NEXT_PUBLIC_MAPLIBRE_STYLE_URL` – Custom MapLibre style (defaults to demo tiles)
- `NEXT_PUBLIC_CESIUM_ION_TOKEN` – Cesium Ion token for imagery

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

### Tests

Install Playwright browsers first:
```bash
npx playwright install
```

Run tests:
```bash
npm test
```

## Usage

| Shortcut | Action |
|---|---|
| `/` or `⌘K` | Open command palette |
| Click satellite | View details & pass predictions |
| ★ icon | Track/untrack satellite |
| 3D / 2D toggle | Switch between globe and flat map |
| LIVE / SIM toggle | Switch between real-time and simulation |

## Data Sources

- TLE data from [CelesTrak](https://celestrak.org) (updated every 6 hours)
- Available groups: Active Satellites, Space Stations, Weather, Starlink, Brightest, GEO Operational

## Architecture

```
app/
  dashboard/page.tsx   # Main dashboard
  settings/page.tsx    # Settings page
  sat/[noradId]/       # Deep link → redirect
  api/tle/route.ts     # TLE proxy with caching
components/
  GlobeCesium.tsx      # 3D globe (canvas renderer)
  Map2D.tsx            # 2D map (MapLibre GL)
  TopBar.tsx           # Top navigation bar
  LeftRail.tsx         # Satellite list panel
  DetailsSheet.tsx     # Satellite details + passes
  AnalyticsDrawer.tsx  # Charts drawer
  TimelineScrubber.tsx # Simulation controls
  CommandPalette.tsx   # Search overlay
lib/
  propagation.ts       # SGP4 propagation helpers
  passes.ts            # Pass prediction
  tle.ts               # TLE parsing + validation
  geo.ts               # Geometry helpers
store/
  useOrbitStore.ts     # Zustand global store
```
