import type { Metadata } from "next";
import { getSquadPoster, getPosterSeasonOptions } from "@/lib/squad-poster";
import { currentSeason } from "@/lib/slugify";
import { SquadPosterView } from "@/components/players/SquadPosterView";
import { BackButton } from "@/components/ui/BackButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Squad Poster",
  description: "Spartan FC's official squad poster, by season.",
};

export default async function SquadPosterPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: requestedSeason } = await searchParams;
  const isValidYear = (value: string) => /^\d{4}$/.test(value) && Number(value) <= Number(currentSeason());
  const season = requestedSeason && isValidYear(requestedSeason) ? requestedSeason : currentSeason();

  const seasons = await getPosterSeasonOptions();
  const poster = await getSquadPoster(season);

  return (
    <div className="bg-[#0b0714]">
      <div className="mx-auto max-w-2xl px-4 pt-4 sm:px-6 lg:max-w-6xl">
        <BackButton fallbackHref="/squad" label="Back to Squad" variant="inverse" className="pt-4" />
      </div>
      <SquadPosterView poster={poster} seasons={seasons} />
    </div>
  );
}
