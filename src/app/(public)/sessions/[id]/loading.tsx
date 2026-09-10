import { Skeleton } from "@/components/ui/Skeleton";

export default function SessionDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Skeleton className="h-[420px] rounded-2xl" />
    </div>
  );
}
