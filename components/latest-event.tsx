import { Calendar, ExternalLink, MapPin, Radio } from "lucide-react";
import type { LatestEvent } from "@/data/groups";
import {
  formatEventDate,
  formatEventKind,
  isEventUpcoming,
} from "@/lib/event-utils";

interface LatestEventProps {
  event: LatestEvent;
  compact?: boolean;
}

export default function LatestEventCard({ event, compact = false }: LatestEventProps) {
  const upcoming = isEventUpcoming(event);
  const kindLabel = formatEventKind(event.kind);

  if (compact) {
    return (
      <div
        className={`rounded-lg border px-3 py-2 text-xs ${
          upcoming
            ? "border-blue-200 bg-blue-50 text-blue-900"
            : "border-slate-200 bg-slate-50 text-slate-500"
        }`}
      >
        <p className={`font-medium truncate ${upcoming ? "text-blue-800" : "text-slate-600"}`}>
          {event.name}
        </p>
        <p className="mt-0.5 opacity-80">{formatEventDate(event)}</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden ${
        upcoming
          ? "border-blue-300 bg-gradient-to-br from-blue-50 via-white to-sky-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                upcoming
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-slate-200 text-slate-600 border border-slate-300"
              }`}
            >
              <Calendar className="w-3 h-3" />
              {upcoming ? "Upcoming event" : "Past event"}
            </span>
            {kindLabel && (
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  upcoming ? "text-blue-700" : "text-slate-500"
                }`}
              >
                <Radio className="w-3 h-3" />
                {kindLabel}
              </span>
            )}
          </div>

          <h3
            className={`text-lg font-bold leading-snug ${
              upcoming ? "text-slate-900" : "text-slate-600"
            }`}
          >
            {event.name}
          </h3>

          <p
            className={`text-sm flex items-center gap-1.5 ${
              upcoming ? "text-blue-800" : "text-slate-500"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {formatEventDate(event)}
          </p>

          {event.venueCity && (
            <p
              className={`text-sm flex items-center gap-1.5 ${
                upcoming ? "text-slate-600" : "text-slate-400"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {event.venueCity}
            </p>
          )}
        </div>

        <a
          href={event.eventUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors shrink-0 ${
            upcoming
              ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 border-2 border-blue-700"
              : "bg-slate-200 text-slate-500 border border-slate-300 hover:bg-slate-300"
          }`}
        >
          {upcoming ? "Register for event" : "View past event"}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {upcoming && (
        <div className="px-5 py-2.5 border-t border-blue-200/80 bg-blue-100/40 text-xs text-blue-800">
          RSVP opens on{" "}
          <a
            href={event.eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:text-blue-900"
          >
            Open Community Groups
          </a>
        </div>
      )}
    </div>
  );
}
