import { cn } from "@/lib/cn";

export function CaptainBadge({ size = "size-6" }: { size?: string }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 font-display font-black text-gray-900 shadow-[0_0_10px_2px_rgba(251,191,36,0.5)] ring-2 ring-[#0b0714]",
        size
      )}
      title="Team Captain"
    >
      C
    </span>
  );
}
