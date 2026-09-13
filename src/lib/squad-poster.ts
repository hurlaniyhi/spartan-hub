import { connectToDatabase } from "@/lib/db";
import { SessionModel } from "@/models/Session";
import { SquadPosterModel, type SquadPoster } from "@/models/SquadPoster";
import { getPlayerRoster } from "@/lib/stats";
import { currentSeason } from "@/lib/slugify";

type SquadPosterPlayerDoc = SquadPoster["players"][number];

export interface SquadPosterPlayer {
  playerId: string;
  slug: string;
  name: string;
  jerseyNumber?: number;
  position: string;
  positionGroup: string;
  photoUrl?: string;
  /** Only really used for a coach's card — their role blurb, and the source
   * of a "Unique number: ..." fallback jersey label (see lib/format.ts). */
  bio?: string;
  isCaptain?: boolean;
}

export interface SquadPosterData {
  season: string;
  players: SquadPosterPlayer[];
  generatedAt: Date;
  /** True for the current season (always regenerated on view); false for a past, frozen season. */
  isLive: boolean;
}

async function generateFromActiveRoster(): Promise<SquadPosterPlayer[]> {
  const roster = await getPlayerRoster();
  return roster
    .filter((player) => player.status === "active")
    .map((player) => ({
      playerId: player.id,
      slug: player.slug,
      name: player.name,
      jerseyNumber: player.jerseyNumber,
      position: player.position,
      positionGroup: player.positionGroup,
      photoUrl: player.photoUrl,
      bio: player.bio,
      isCaptain: player.isCaptain,
    }));
}

/**
 * The current season's poster always reflects who's active right now —
 * every view regenerates and re-saves it. Once a season ends, its poster
 * is frozen: whatever was last generated (either from a live view while it
 * was current, or generated once on first view after the fact) is what
 * everyone sees from then on, so the roster can't silently change under a
 * past season just because today's active-player list has moved on.
 */
export async function getSquadPoster(season: string): Promise<SquadPosterData> {
  await connectToDatabase();
  const isCurrent = season === currentSeason();

  if (!isCurrent) {
    const existing = await SquadPosterModel.findOne({ season }).lean();
    if (existing) {
      return {
        season,
        players: existing.players.map((player: SquadPosterPlayerDoc) => ({
          playerId: player.playerId.toString(),
          slug: player.slug,
          name: player.name,
          jerseyNumber: player.jerseyNumber ?? undefined,
          position: player.position,
          positionGroup: player.positionGroup,
          photoUrl: player.photoUrl ?? undefined,
          bio: player.bio ?? undefined,
          isCaptain: player.isCaptain ?? undefined,
        })),
        generatedAt: existing.generatedAt,
        isLive: false,
      };
    }
  }

  const players = await generateFromActiveRoster();
  const generatedAt = new Date();
  await SquadPosterModel.findOneAndUpdate(
    { season },
    { $set: { players, generatedAt } },
    { upsert: true }
  );

  return { season, players, generatedAt, isLive: isCurrent };
}

/** Seasons worth offering on the poster's season picker: any with a real session, any with a previously-generated poster, plus the current year. */
export async function getPosterSeasonOptions(): Promise<string[]> {
  await connectToDatabase();
  const [sessionSeasons, posterSeasons] = [
    await SessionModel.distinct("season"),
    await SquadPosterModel.distinct("season"),
  ];
  const all = new Set<string>([...sessionSeasons, ...posterSeasons, currentSeason()]);
  return Array.from(all)
    .filter((season) => Number(season) <= Number(currentSeason()))
    .sort((a, b) => Number(b) - Number(a));
}
