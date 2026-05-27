"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CityGroup } from "@/data/groups";

const defaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ cities }: { cities: CityGroup[] }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current || cities.length <= 1) return;
    hasFitted.current = true;

    const bounds = L.latLngBounds(cities.map((c) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [40, 40], animate: false });
  }, [map, cities]);

  return null;
}

interface CityMapProps {
  cities: CityGroup[];
  onCityClick?: (slug: string) => void;
  zoom?: number;
  className?: string;
}

export default function CityMap({
  cities,
  onCityClick,
  zoom = 7,
  className = "w-full h-full",
}: CityMapProps) {
  const mapKey = useMemo(() => cities.map((c) => c.slug).join(","), [cities]);

  const center: [number, number] =
    cities.length === 1
      ? [cities[0].lat, cities[0].lng]
      : [
          cities.reduce((s, c) => s + c.lat, 0) / cities.length,
          cities.reduce((s, c) => s + c.lng, 0) / cities.length,
        ];

  const mapZoom = cities.length === 1 ? zoom : Math.min(zoom, 7);

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={mapZoom}
      className={className}
      scrollWheelZoom={false}
      style={{ borderRadius: "inherit", height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxNativeZoom={19}
        updateWhenIdle
      />
      <FitBounds cities={cities} />
      {cities.map((city) => (
        <Marker
          key={city.slug}
          position={[city.lat, city.lng]}
          icon={defaultIcon}
          eventHandlers={{
            click: () => onCityClick?.(city.slug),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{city.name}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
