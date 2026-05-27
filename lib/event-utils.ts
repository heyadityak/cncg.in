import type { LatestEvent } from "@/data/groups";

export function isEventUpcoming(event: LatestEvent, now = new Date()): boolean {
  return new Date(event.startsAt) > now;
}

export function formatEventDate(
  event: LatestEvent,
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }
): string {
  const date = new Date(event.startsAt);
  const timeZone = event.timezone || "Asia/Kolkata";
  return new Intl.DateTimeFormat("en-IN", { ...options, timeZone }).format(
    date
  );
}

export function formatEventKind(kind?: string): string | undefined {
  if (!kind) return undefined;
  if (kind === "in-person") return "In person";
  if (kind === "virtual") return "Virtual";
  if (kind === "hybrid") return "Hybrid";
  return kind;
}
