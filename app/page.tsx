import Link from "next/link";
import { MapPin, Users, Globe } from "lucide-react";
import { groups } from "@/data/groups";
import IndiaMapClient from "@/components/india-map-client";
import NearestGroup from "@/components/nearest-group";
import SiteFooter from "@/components/site-footer";

const totalGroups = groups.reduce((sum, s) => sum + s.cities.length, 0);
const totalStates = groups.length;

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900">CNCG India</span>
            <span className="hidden sm:inline text-slate-400 text-sm ml-2">
              Cloud Native Community Groups
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a
            href="https://community.cncf.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            CNCF Community
          </a>
          <a
            href="https://github.com/cncg-in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            GitHub
          </a>
        </nav>
      </header>

      {/* Hero + Stats */}
      <div className="px-6 py-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          Find Your Cloud Native Community
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto mb-6">
          Discover CNCF-affiliated groups across India. Click a highlighted
          state to explore groups in that region.
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-sm text-slate-700">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>
              <strong>{totalStates}</strong> states
            </span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5 text-sm text-slate-700">
            <Users className="w-4 h-4 text-blue-500" />
            <span>
              <strong>{totalGroups}</strong> community groups
            </span>
          </div>
        </div>
      </div>

      {/* Nearest group finder */}
      <NearestGroup />

      {/* Main layout: map + sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 px-4 pb-8 max-w-7xl mx-auto w-full">
        {/* Map */}
        <div className="flex-1 h-[60vh] min-h-[380px] lg:h-[70vh] lg:min-h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <IndiaMapClient />
        </div>

        {/* Sidebar: state list */}
        <aside className="lg:w-80 lg:ml-4 mt-4 lg:mt-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full lg:h-[70vh] lg:max-h-[520px] overflow-y-auto">
            <div className="p-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-semibold text-slate-900">States &amp; Groups</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any state to see its groups
              </p>
            </div>
            <ul className="divide-y divide-slate-50">
              {groups.map((state) => (
                <li key={state.slug}>
                  <Link
                    href={
                      process.env.NODE_ENV === "development"
                        ? `/state/${state.slug}`
                        : `https://${state.slug}.cncg.in`
                    }
                    className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-slate-800 group-hover:text-blue-700 text-sm">
                        {state.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {state.cities.map((c) => c.name).join(", ")}
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 ml-2 shrink-0">
                      {state.cities.length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Legend */}
      <div className="px-6 pb-8 flex items-center justify-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
          States with CNCG groups
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" />
          No groups yet
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-white border-2 border-blue-500 inline-block" />
          City group
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
