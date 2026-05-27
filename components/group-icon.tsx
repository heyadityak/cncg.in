import type { CityGroup } from "@/data/groups";

type GroupIconSize = "sm" | "md" | "lg";

const sizeClasses: Record<GroupIconSize, string> = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-16 h-16 rounded-2xl",
  lg: "w-24 h-24 rounded-2xl",
};

const textClasses: Record<GroupIconSize, string> = {
  sm: "text-sm",
  md: "text-2xl",
  lg: "text-3xl",
};

interface GroupIconProps {
  city: Pick<CityGroup, "name" | "iconUrl">;
  size?: GroupIconSize;
  className?: string;
}

export default function GroupIcon({
  city,
  size = "md",
  className = "",
}: GroupIconProps) {
  const base = `${sizeClasses[size]} flex-shrink-0 overflow-hidden border border-slate-200 bg-white shadow-sm ${className}`;

  if (city.iconUrl) {
    return (
      <div className={base}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={city.iconUrl}
          alt={`${city.name} group icon`}
          className="h-full w-full object-contain p-1"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${base} bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold ${textClasses[size]}`}
    >
      {city.name.charAt(0)}
    </div>
  );
}
