import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowLeft, ChevronRight, Users } from "lucide-react";
import { getCity, groups } from "@/data/groups";
import JoinCta from "@/components/join-cta";
import GroupIcon from "@/components/group-icon";
import LatestEventCard from "@/components/latest-event";
import CityMapClient from "@/components/city-map-client";
import SiteFooter from "@/components/site-footer";
import JsonLd from "@/components/json-ld";
import {
  absoluteAssetUrl,
  cityCanonical,
  cityDescription,
  cityJsonLd,
  cityKeywords,
  cityTitle,
  stateCanonical,
} from "@/lib/seo";

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
  const title = cityTitle(city.name);
  const description = cityDescription(city, state);
  const canonical = cityCanonical(city.slug);
  const keywords = cityKeywords(city, state);
  const ogImage = city.iconUrl
    ? absoluteAssetUrl(city.iconUrl, canonical)
    : undefined;

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "CNCG India",
      locale: "en_IN",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, alt: `CNCF ${city.name}` }] } : {}),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const result = getCity(citySlug);

  if (!result) notFound();

  const { city, state } = result;
  const siblings = state.cities.filter((c) => c.slug !== city.slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <JsonLd data={cityJsonLd(city, state)} />

      {/* Header / Breadcrumb */}
      <header className="px-6 py-4 flex items-center gap-2 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20 flex-wrap">
        <Link
          href={
            process.env.NODE_ENV === "development" ? "/" : "https://cncg.in"
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
              : stateCanonical(state.slug)
          }
          className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          {state.name}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-sm font-semibold text-slate-900">
          CNCF {city.name}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start">
          <GroupIcon city={city} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                CNCF {city.name}
              </h1>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-100 rounded-md px-2 py-0.5 mt-1">
                {city.slug}.cncg.in
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              Cloud Native Community Group (CNCG) &middot;{" "}
              <span className="font-medium text-slate-700">{state.name}</span>
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Also known as{" "}
              <span className="font-medium text-slate-800">
                Cloud Native {city.name}
              </span>{" "}
              and{" "}
              <span className="font-medium text-slate-800">
                CNCG {city.name}
              </span>
              .
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
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
            About CNCF {city.name}
          </h2>
          <p className="text-slate-700 leading-relaxed">
            {city.description ?? cityDescription(city, state)}
          </p>
          <p className="text-slate-700 leading-relaxed mt-3">
            Looking for <strong>CNCF {city.name}</strong>,{" "}
            <strong>Cloud Native {city.name}</strong>, or{" "}
            <strong>CNCG {city.name}</strong>? This is the local Cloud Native
            Community Group in {city.name}, {state.name} — a place for
            developers, SREs, platform engineers, and students to learn
            Kubernetes, CNCF projects, and cloud-native practices together.
          </p>
        </div>

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

        {/* Latest event */}
        {city.latestEvent && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Latest CNCF {city.name} event
            </h2>
            <LatestEventCard event={city.latestEvent} />
          </div>
        )}

        {/* Join CTA */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Join Cloud Native {city.name}
          </h2>
          <JoinCta city={city} />
        </div>

        {/* FAQ — keyword-rich, matches FAQ schema */}
        <section aria-labelledby="city-faq-heading">
          <h2
            id="city-faq-heading"
            className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3"
          >
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 text-sm">
                What is CNCF {city.name}?
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                CNCF {city.name} (also called CNCG {city.name} or Cloud Native{" "}
                {city.name}) is the local Cloud Native Community Group serving{" "}
                {city.name} and nearby areas in {state.name}. The community runs
                meetups and workshops on Kubernetes and the broader CNCF
                ecosystem.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 text-sm">
                How do I join Cloud Native {city.name}?
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                Use the links above to join the group, follow social channels, or
                submit a talk via the CFP form when available. Newcomers and
                experienced practitioners are welcome at CNCG {city.name} events.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 text-sm">
                Is CNCG {city.name} the same as CNCF {city.name}?
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                Yes. CNCG stands for Cloud Native Community Group. Searches for
                CNCF {city.name}, Cloud Native {city.name}, and CNCG {city.name}{" "}
                all refer to this same local chapter.
              </p>
            </div>
          </div>
        </section>

        {/* Other groups in state */}
        {siblings.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Other Cloud Native groups in {state.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {siblings.map((sibling) => (
                <Link
                  key={sibling.slug}
                  href={
                    process.env.NODE_ENV === "development"
                      ? `/city/${sibling.slug}`
                      : cityCanonical(sibling.slug)
                  }
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                >
                  <GroupIcon
                    city={sibling}
                    size="sm"
                    className="shadow-none"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 group-hover:text-blue-700 truncate">
                      CNCF {sibling.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      Cloud Native {sibling.name} · {sibling.slug}.cncg.in
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter showBackLink />
    </div>
  );
}
