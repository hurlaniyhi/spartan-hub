import type { Metadata } from "next";
import { Users } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
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
    <div>
      <PageHero
        icon={Users}
        title="Squad"
        subtitle="Every player who has pulled on the Spartan FC shirt."
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <SquadGrid roster={roster} />
      </div>
    </div>
  );
}
