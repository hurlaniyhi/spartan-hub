import Image from "next/image";
import { cn } from "@/lib/cn";

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

export function PlayerAvatar({
  photoUrl,
  name,
  size = "md",
  className,
}: {
  photoUrl?: string;
  name: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden rounded-full bg-gray-100", sizeClasses[size], className)}>
        <Image src={photoUrl} alt={name} fill className="object-cover" sizes="128px" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-light font-display font-bold text-brand",
        sizeClasses[size],
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
