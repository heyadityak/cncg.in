"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { CityGroup } from "@/data/groups";

const CityMap = dynamic(() => import("@/components/city-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface CityMapClientProps {
  cities: CityGroup[];
  stateSlug?: string;
  zoom?: number;
}

export default function CityMapClient({
  cities,
  stateSlug,
  zoom,
}: CityMapClientProps) {
  const router = useRouter();

  const handleCityClick = (citySlug: string) => {
    if (process.env.NODE_ENV === "development") {
      router.push(`/city/${citySlug}`);
    } else {
      window.location.href = `https://${citySlug}.cncg.in`;
    }
  };

  return (
    <div className="w-full h-full">
      <CityMap cities={cities} onCityClick={handleCityClick} zoom={zoom} />
    </div>
  );
}
