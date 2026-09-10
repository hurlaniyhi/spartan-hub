import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  size = 40,
  withWordmark = true,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/images/spartan-logo.jpeg"
        alt="Spartan FC crest"
        width={size}
        height={size}
        className="rounded-full object-cover"
        priority
      />
      {withWordmark && (
        <span className="font-display text-lg font-bold leading-none tracking-tight text-brand-dark">
          SPARTAN FC
        </span>
      )}
    </Link>
  );
}
