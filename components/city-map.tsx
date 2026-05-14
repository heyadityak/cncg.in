"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CityGroup } from "@/data/groups";

// Fix Leaflet's default icon path issue with webpack/Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ cities }: { cities: CityGroup[] }) {
  const map = useMap();
  useEffect(() => {
    if (cities.length === 1) {
      map.setView([cities[0].lat, cities[0].lng], 11);
    } else if (cities.length > 1) {
      const bounds = L.latLngBounds(cities.map((c) => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
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
  const center: [number, number] =
    cities.length === 1
      ? [cities[0].lat, cities[0].lng]
      : [
          cities.reduce((s, c) => s + c.lat, 0) / cities.length,
          cities.reduce((s, c) => s + c.lng, 0) / cities.length,
        ];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      scrollWheelZoom={false}
      style={{ borderRadius: "inherit" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
