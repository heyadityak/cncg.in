"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamic import defers the GeoJSON computation to the client
const IndiaMap = dynamic(() => import("@/components/india-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading map…</p>
      </div>
    </div>
  ),
});

export default function IndiaMapClient() {
  const router = useRouter();

  const handleStateClick = (stateSlug: string) => {
    if (process.env.NODE_ENV === "development") {
      router.push(`/state/${stateSlug}`);
    } else {
      window.location.href = `https://${stateSlug}.cncg.in`;
    }
  };

  return (
    <div className="w-full h-full">
      <IndiaMap onStateClick={handleStateClick} />
    </div>
  );
}
