import { ExternalLink, Globe, Users, X } from "lucide-react";
import type { ReactNode } from "react";
import type { CityGroup } from "@/data/groups";

interface JoinCtaProps {
  city: CityGroup;
}

type LinkItem = {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
  color: string;
};

export default function JoinCta({ city }: JoinCtaProps) {
  const links: LinkItem[] = [];

  if (city.twitterUrl) {
    links.push({
      href: city.twitterUrl,
      label: "Follow on X",
      description: "Stay updated on announcements",
      icon: <X className="w-5 h-5" />,
      color: "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100",
    });
  }

  if (city.linkedinUrl) {
    links.push({
      href: city.linkedinUrl,
      label: "LinkedIn Group",
      description: "Connect with members",
      icon: <Globe className="w-5 h-5" />,
      color: "bg-sky-50 border-sky-100 text-sky-700 hover:bg-sky-100",
    });
  }

  return (
    <div className="space-y-3">
      {city.ocGroupUrl && (
        <a
          href={city.ocGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 rounded-2xl border-2 border-blue-600 bg-blue-600 px-5 py-4 text-white shadow-md hover:bg-blue-700 hover:border-blue-700 transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-base leading-tight">Join Community</p>
              <p className="text-xs text-blue-100 truncate">
                View events &amp; RSVP on Open Community Groups
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 opacity-75 flex-shrink-0 group-hover:opacity-100 transition-opacity" />
        </a>
      )}

      {links.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${link.color}`}
            >
              <span className="flex-shrink-0">{link.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{link.label}</p>
                <p className="text-xs opacity-70 truncate">{link.description}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
            </a>
          ))}
        </div>
      )}

      {!city.ocGroupUrl && links.length === 0 && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-500">
          Links coming soon. Check back for updates.
        </div>
      )}
    </div>
  );
}
