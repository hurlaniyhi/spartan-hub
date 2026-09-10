import { Skeleton } from "@/components/ui/Skeleton";

export default function PlayerProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Skeleton className="h-[420px] rounded-2xl" />
    </div>
  );
}
