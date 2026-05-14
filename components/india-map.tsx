"use client";

import { useState, useEffect } from "react";
import { groups } from "@/data/groups";

// ─── Mercator projection ─────────────────────────────────────────────────────
// Fits India (lat 6.75–37.1, lng 68–97.5) inside a 600×520 SVG with ~20px padding.
const SVG_W = 600;
const SVG_H = 520;
const SCALE = 550;
const CENTER_LNG = 82.5;
const CENTER_LAT = 29.0;
const lntan = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const LNTAN_C = lntan(CENTER_LAT);

function px(lng: number) {
  return SCALE * ((lng - CENTER_LNG) * Math.PI) / 180 + SVG_W / 2;
}
function py(lat: number) {
  return -SCALE * (lntan(lat) - LNTAN_C) + SVG_H / 2;
}

function ringToD(ring: number[][]): string {
  return (
    ring
      .map(
        (c, i) =>
          `${i === 0 ? "M" : "L"}${px(c[0]).toFixed(2)},${py(c[1]).toFixed(2)}`
      )
      .join(" ") + " Z"
  );
}

type GeoCoord = number[][];
type GeoFeature = {
  properties: { NAME_1: string };
  geometry: {
    type: string;
    coordinates: GeoCoord[] | GeoCoord[][];
  };
};

function featureToD(feature: GeoFeature): string {
  const { type, coordinates } = feature.geometry;
  if (type === "Polygon") {
    return (coordinates as GeoCoord[]).map(ringToD).join(" ");
  }
  // MultiPolygon
  return (coordinates as GeoCoord[][])
    .flatMap((poly) => poly.map(ringToD))
    .join(" ");
}

// ─── Active states ────────────────────────────────────────────────────────────
const ACTIVE_STATE_SLUGS = new Set(groups.map((g) => g.slug));

const NAME_TO_SLUG: Record<string, string> = {
  "Tamil Nadu": "tamil-nadu",
  "West Bengal": "west-bengal",
  "Uttar Pradesh": "uttar-pradesh",
  "NCT of Delhi": "delhi",
  "Nct Of Delhi": "delhi",
  /** GeoJSON NAME_1; data state slug is `chandigarh-ut` (city remains `chandigarh`) */
  Chandigarh: "chandigarh-ut",
};

function nameToSlug(name: string): string {
  return NAME_TO_SLUG[name] ?? name.toLowerCase().replace(/\s+/g, "-");
}

// ─── Component ────────────────────────────────────────────────────────────────
interface IndiaMapProps {
  onStateClick: (stateSlug: string) => void;
}

interface StateShape {
  name: string;
  slug: string;
  active: boolean;
  d: string;
}

interface Tooltip {
  name: string;
  active: boolean;
  x: number;
  y: number;
}

export default function IndiaMap({ onStateClick }: IndiaMapProps) {
  const [shapes, setShapes] = useState<StateShape[] | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    fetch("/india-states-simple.geojson")
      .then((r) => r.json())
      .then((geojson: { features: GeoFeature[] }) => {
        const computed = geojson.features.map((f) => {
          const name = f.properties.NAME_1;
          const slug = nameToSlug(name);
          return {
            name,
            slug,
            active: ACTIVE_STATE_SLUGS.has(slug),
            d: featureToD(f),
          };
        });
        setShapes(computed);
      })
      .catch(console.error);
  }, []);

  if (!shapes) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading map…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={{ background: "#e8eef4" }}>
      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900 border border-slate-700 rounded-lg shadow-xl px-3 py-2 text-sm"
          style={{ left: tooltip.x + 14, top: tooltip.y - 48 }}
        >
          <p className="font-semibold text-slate-100">{tooltip.name}</p>
          {tooltip.active ? (
            <p className="text-xs text-blue-300 mt-0.5">Click to explore groups →</p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5">No groups yet</p>
          )}
        </div>
      )}

      {/* SVG Map — viewBox cropped to India's actual extent + padding */}
      <svg
        viewBox="140 152 325 350"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        {shapes.map(({ name, slug, active, d }) => {
          const hovered = hoveredSlug === slug;
          return (
            <path
              key={slug + "-" + name}
              d={d}
              fill={active ? (hovered ? "#2563eb" : "#3b82f6") : (hovered ? "#94a3b8" : "#b0bec5")}
              fillOpacity={active ? (hovered ? 0.9 : 0.7) : (hovered ? 0.45 : 0.3)}
              stroke="#ffffff"
              strokeWidth={hovered ? 1 : 0.6}
              strokeOpacity={0.9}
              style={{ cursor: active ? "pointer" : "default", transition: "fill 0.15s ease" }}
              onMouseEnter={(e) => {
                setHoveredSlug(slug);
                setTooltip({ name, active, x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null);
              }}
              onMouseLeave={() => {
                setHoveredSlug(null);
                setTooltip(null);
              }}
              onClick={() => {
                if (active) onStateClick(slug);
              }}
            />
          );
        })}

        {/* City markers */}
        {groups.map((state) =>
          state.cities.map((city) => (
            <circle
              key={city.slug}
              cx={px(city.lng)}
              cy={py(city.lat)}
              r={4.5}
              fill="#ffffff"
              stroke="#1d4ed8"
              strokeWidth={1.5}
              style={{ cursor: "pointer" }}
              onClick={() => onStateClick(state.slug)}
            />
          ))
        )}
      </svg>
    </div>
  );
}
