import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowLeft, Users, ChevronRight } from "lucide-react";
import { getState, groups } from "@/data/groups";
import CityMapClient from "@/components/city-map-client";

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  return groups.map((g) => ({ state: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const stateData = getState(stateSlug);
  if (!stateData) return {};
  return {
    title: `${stateData.name} — CNCG India`,
    description: `Cloud Native Community Groups in ${stateData.name}. Find CNCG events in ${stateData.cities.map((c) => c.name).join(", ")}.`,
  };
}

export default async function StatePage({ params }: Props) {
  const { state: stateSlug } = await params;
  const stateData = getState(stateSlug);

  if (!stateData) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-3 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <Link
          href={
            process.env.NODE_ENV === "development"
              ? "/"
              : "https://cncg.in"
          }
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          India
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-900">{stateData.name}</span>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* State hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {stateData.name}
          </h1>
          <p className="text-slate-600">
            Cloud Native Community Groups in {stateData.name}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Users className="w-4 h-4 text-blue-500" />
              <span>
                <strong>{stateData.cities.length}</strong> group
                {stateData.cities.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{stateData.cities.map((c) => c.name).join(", ")}</span>
            </div>
          </div>
        </div>

        {/* Map + city list layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 h-72 lg:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <CityMapClient
              cities={stateData.cities}
              stateSlug={stateData.slug}
              zoom={7}
            />
          </div>

          {/* City list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h2 className="font-semibold text-slate-800 text-sm">
                  Groups in {stateData.name}
                </h2>
              </div>
              <ol className="divide-y divide-slate-50">
                {stateData.cities.map((city, idx) => (
                  <li key={city.slug}>
                    <Link
                      href={
                        process.env.NODE_ENV === "development"
                          ? `/city/${city.slug}`
                          : `https://${city.slug}.cncg.in`
                      }
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-blue-50 transition-colors group"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 group-hover:text-blue-700 text-sm truncate">
                          {city.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {city.slug}.cncg.in
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Sub-domain notice */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800">
          <strong>Pro tip:</strong> Each city has its own subdomain. Visit{" "}
          {stateData.cities.slice(0, 2).map((c, i) => (
            <span key={c.slug}>
              {i > 0 && ", "}
              <a
                href={`https://${c.slug}.cncg.in`}
                className="font-mono underline hover:text-blue-600"
              >
                {c.slug}.cncg.in
              </a>
            </span>
          ))}{" "}
          and more.
        </div>
      </main>
    </div>
  );
}
