import { SessionForm } from "@/components/admin/SessionForm";
import { getActivePlayers } from "@/lib/stats";
import type { SessionType } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const roster = await getActivePlayers();
  const defaultType: SessionType = type === "match" ? "match" : "training";

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold text-gray-900">Record Session</h1>
      <p className="mb-6 text-sm text-gray-500">
        Fill this in on the pitch straight after training or a match.
      </p>
      <SessionForm roster={roster} defaultType={defaultType} />
    </div>
  );
}
