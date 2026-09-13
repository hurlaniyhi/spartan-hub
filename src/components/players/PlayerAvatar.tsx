import Image from "next/image";
import { cn } from "@/lib/cn";
import { CaptainBadge } from "@/components/players/CaptainBadge";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const sizeClasses = {
  sm: "size-10 text-sm",
  md: "size-14 text-base",
  lg: "size-24 text-2xl",
  xl: "size-32 text-3xl",
};

const captainBadgeSizes = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
  xl: "size-8",
};

export function PlayerAvatar({
  photoUrl,
  name,
  size = "md",
  isCaptain = false,
  className,
}: {
  photoUrl?: string;
  name: string;
  size?: keyof typeof sizeClasses;
  isCaptain?: boolean;
  className?: string;
}) {
  return (
    <div className="relative inline-block shrink-0">
      {photoUrl ? (
        <div className={cn("relative overflow-hidden rounded-full bg-white/10", sizeClasses[size], className)}>
          <Image src={photoUrl} alt={name} fill className="object-cover" sizes="128px" />
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-brand-light font-display font-bold text-brand",
            sizeClasses[size],
            className
          )}
          aria-hidden
        >
          {initials(name)}
        </div>
      )}
      {isCaptain && (
        <div className="absolute -bottom-1 -right-1">
          <CaptainBadge size={captainBadgeSizes[size]} />
        </div>
      )}
    </div>
  );
}
