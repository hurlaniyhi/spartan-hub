import type { Metadata } from "next";
import { SquadGrid } from "@/components/players/SquadGrid";
import { getPlayerRoster } from "@/lib/stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Squad",
  description: "The full Spartan FC squad — players, positions and stats.",
};

export default async function SquadPage() {
  const roster = await getPlayerRoster();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900">Squad</h1>
        <p className="mt-1 text-sm text-gray-500">Every player who has pulled on the Spartan FC shirt.</p>
      </div>
      <SquadGrid roster={roster} />
    </div>
  );
}
