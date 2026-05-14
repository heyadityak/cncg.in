import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowLeft, ChevronRight, Users } from "lucide-react";
import { getCity, groups } from "@/data/groups";
import JoinCta from "@/components/join-cta";
import CityMapClient from "@/components/city-map-client";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return groups.flatMap((state) =>
    state.cities.map((city) => ({ city: city.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const result = getCity(citySlug);
  if (!result) return {};
  const { city, state } = result;
  return {
    title: `${city.name} CNCG — Cloud Native Community Group`,
    description:
      city.description ??
      `Cloud Native Computing Group ${city.name}, ${state.name}. Join the local CNCF community.`,
  };
}

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const result = getCity(citySlug);

  if (!result) notFound();

  const { city, state } = result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header / Breadcrumb */}
      <header className="px-6 py-4 flex items-center gap-2 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20 flex-wrap">
        <Link
          href={
            process.env.NODE_ENV === "development"
              ? "/"
              : "https://cncg.in"
          }
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          India
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <Link
          href={
            process.env.NODE_ENV === "development"
              ? `/state/${state.slug}`
              : `https://${state.slug}.cncg.in`
          }
          className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          {state.name}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-sm font-semibold text-slate-900">{city.name}</span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {city.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{city.name}</h1>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-100 rounded-md px-2 py-0.5 mt-1">
                {city.slug}.cncg.in
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              Cloud Native Community Group &middot;{" "}
              <span className="font-medium text-slate-700">{state.name}</span>
            </p>
            {city.organizer && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-600">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Organised by {city.organizer}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {city.description && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
              About this group
            </h2>
            <p className="text-slate-700 leading-relaxed">{city.description}</p>
          </div>
        )}

        {/* Map */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Location
          </h2>
          <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <CityMapClient cities={[city]} zoom={12} />
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-center">
            Map data &copy;{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500"
            >
              OpenStreetMap
            </a>{" "}
            contributors
          </p>
        </div>

        {/* Join CTA */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Get involved
          </h2>
          <JoinCta city={city} />
        </div>

        {/* Other groups in state */}
        {state.cities.length > 1 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Other groups in {state.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.cities
                .filter((c) => c.slug !== city.slug)
                .map((sibling) => (
                  <Link
                    key={sibling.slug}
                    href={
                      process.env.NODE_ENV === "development"
                        ? `/city/${sibling.slug}`
                        : `https://${sibling.slug}.cncg.in`
                    }
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {sibling.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 group-hover:text-blue-700 truncate">
                        {sibling.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate font-mono">
                        {sibling.slug}.cncg.in
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                  </Link>
                ))}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        <Link
          href={
            process.env.NODE_ENV === "development"
              ? "/"
              : "https://cncg.in"
          }
          className="hover:text-blue-500 transition-colors"
        >
          ← Back to CNCG India
        </Link>
        {" "}&middot;{" "}
        <a
          href="https://cncf.io"
          className="hover:text-blue-500 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          CNCF
        </a>
      </footer>
    </div>
  );
}
