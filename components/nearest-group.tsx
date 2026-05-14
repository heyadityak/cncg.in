"use client";

import { useState } from "react";
import { Navigation, MapPin, ExternalLink, Loader2, LocateFixed } from "lucide-react";
import { groups } from "@/data/groups";
import type { CityGroup, StateGroup } from "@/data/groups";

// Haversine distance between two lat/lng points (returns km)
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type NearestResult = {
  city: CityGroup;
  state: StateGroup;
  distanceKm: number;
};

type Status = "idle" | "loading" | "success" | "denied" | "error";

function findNearest(lat: number, lng: number): NearestResult {
  let best: NearestResult | null = null;
  for (const state of groups) {
    for (const city of state.cities) {
      const d = haversine(lat, lng, city.lat, city.lng);
      if (!best || d < best.distanceKm) {
        best = { city, state, distanceKm: d };
      }
    }
  }
  return best!;
}

export default function NearestGroup() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<NearestResult | null>(null);

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearest(pos.coords.latitude, pos.coords.longitude);
        setResult(nearest);
        setStatus("success");
      },
      (err) => {
        setStatus(err.code === 1 ? "denied" : "error");
      },
      { timeout: 10000 }
    );
  };

  const cityUrl =
    process.env.NODE_ENV === "development"
      ? result ? `/city/${result.city.slug}` : "#"
      : result ? `https://${result.city.slug}.cncg.in` : "#";


  return (
    <div className="mx-4 mb-6 max-w-7xl lg:mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <LocateFixed className="w-4 h-4 text-blue-500 shrink-0" />
          <h2 className="font-semibold text-slate-900 text-sm">Nearest Community Group</h2>
        </div>

        {status === "idle" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-sm text-slate-500 flex-1">
              Find the CNCG group closest to your current location.
            </p>
            <button
              onClick={locate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
            >
              <Navigation className="w-4 h-4" />
              Detect my location
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            Detecting your location…
          </div>
        )}

        {status === "denied" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-sm text-amber-600">
              Location permission was denied. Please allow it in your browser settings and try again.
            </p>
            <button
              onClick={locate}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors shrink-0"
            >
              <Navigation className="w-4 h-4" />
              Try again
            </button>
          </div>
        )}

        {status === "error" && (
          <p className="text-sm text-red-500">
            Could not determine your location. Please try again.
          </p>
        )}

        {status === "success" && result && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Group info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  Cloud Native {result.city.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {result.state.name} ·{" "}
                  {result.distanceKm < 10
                    ? "< 10 km away"
                    : `~${Math.round(result.distanceKm / 10) * 10} km away`}
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={cityUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                View group
              </a>
              {result.city.ocGroupUrl && (
                <a
                  href={result.city.ocGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Join on CNCF
                </a>
              )}
              <button
                onClick={() => { setStatus("idle"); setResult(null); }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors ml-1"
                title="Reset"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
