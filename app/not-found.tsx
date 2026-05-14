import Link from "next/link";
import { Globe, MapPin } from "lucide-react";
import SiteFooter from "@/components/site-footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Group Not Found
        </h1>
        <p className="text-slate-600 mb-2">
          We couldn&apos;t find a Cloud Native Community Group for that
          subdomain.
        </p>
        <p className="text-sm text-slate-500 mb-8">
          If you think there should be a CNCG in your area, consider starting
          one through the{" "}
          <a
            href="https://community.cncf.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            CNCF Community platform
          </a>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={
              process.env.NODE_ENV === "development"
                ? "/"
                : "https://cncg.in"
            }
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Browse all groups
          </Link>
          <a
            href="https://community.cncf.io/chapters"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 font-semibold text-sm hover:border-blue-200 hover:bg-blue-50 transition-colors"
          >
            Start a CNCG
          </a>
        </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
