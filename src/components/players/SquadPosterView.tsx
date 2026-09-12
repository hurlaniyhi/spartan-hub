import Image from "next/image";
import { FileDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { getJerseyLabel } from "@/lib/format";
import { POSITION_GROUPS, STAFF_GROUP, type PositionGroup } from "@/lib/constants";
import type { SquadPosterData, SquadPosterPlayer } from "@/lib/squad-poster";
import { SeasonSwitcher } from "@/components/statistics/SeasonSwitcher";
import { Button } from "@/components/ui/Button";

const POSITION_ABBR: Record<PositionGroup, string> = {
  Goalkeeper: "GK",
  Defender: "DEF",
  Midfielder: "MID",
  Forward: "FWD",
};

const GROUP_LABEL: Record<PositionGroup, string> = {
  Goalkeeper: "Goalkeepers",
  Defender: "Defenders",
  Midfielder: "Midfielders",
  Forward: "Forwards",
};

const GROUP_STYLE: Record<
  PositionGroup,
  { bar: string; ring: string; glow: string; gradient: string }
> = {
  Goalkeeper: {
    bar: "bg-amber-400",
    ring: "ring-amber-400/70",
    glow: "shadow-[0_0_26px_4px_rgba(251,191,36,0.35)]",
    gradient: "from-amber-400 to-orange-500",
  },
  Defender: {
    bar: "bg-sky-400",
    ring: "ring-sky-400/70",
    glow: "shadow-[0_0_26px_4px_rgba(56,189,248,0.35)]",
    gradient: "from-sky-400 to-blue-600",
  },
  Midfielder: {
    bar: "bg-emerald-400",
    ring: "ring-emerald-400/70",
    glow: "shadow-[0_0_26px_4px_rgba(52,211,153,0.35)]",
    gradient: "from-emerald-400 to-teal-600",
  },
  Forward: {
    bar: "bg-accent",
    ring: "ring-accent/70",
    glow: "shadow-[0_0_26px_4px_rgba(219,38,29,0.4)]",
    gradient: "from-accent to-rose-600",
  },
};

function PosterPlayerCard({ player }: { player: SquadPosterPlayer }) {
  const style = GROUP_STYLE[player.positionGroup as PositionGroup] ?? GROUP_STYLE.Midfielder;
  const abbr = POSITION_ABBR[player.positionGroup as PositionGroup] ?? player.position.slice(0, 3).toUpperCase();

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] px-4 pb-4 pt-3.5 text-center">
      <span className="absolute left-3 top-3.5 flex size-7 items-center justify-center rounded-full bg-white text-xs font-black text-gray-900">
        {getJerseyLabel(player)}
      </span>
      <span className="absolute right-3 top-3.5 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/80">
        {abbr}
      </span>

      <div className="mx-auto mt-4 flex size-28 shrink-0 items-center justify-center">
        <div className={cn("relative size-28 overflow-hidden rounded-full bg-brand-dark ring-4", style.ring, style.glow)}>
          {player.photoUrl ? (
            <Image src={player.photoUrl} alt={player.name} fill sizes="112px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-brand-light font-display text-3xl font-bold text-brand">
              {player.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("")}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-brand-dark/90 py-1">
            <Image src="/images/spartan-logo.jpeg" alt="" width={11} height={11} className="rounded-full" />
            <span className="text-[8px] font-black tracking-wider text-white">SPFC</span>
          </div>
        </div>
      </div>

      <p className="mt-3 truncate font-display text-base font-black uppercase tracking-wide text-white">
        {player.name}
      </p>
      <p className="mt-1 text-xs font-semibold text-white/50">
        {abbr} <span className="text-white/30">•</span> #{getJerseyLabel(player)}
      </p>

      <div className="mt-3 flex flex-col items-center border-t border-white/10 pt-3">
        <div className={cn("h-1 w-16 rounded-full bg-gradient-to-r", style.gradient)} />
      </div>
    </div>
  );
}

function TechnicalStaffCard({ coach, summary }: { coach: SquadPosterPlayer; summary?: string }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] px-6 py-8 text-center">
      <div className="mx-auto flex size-28 items-center justify-center">
        <div className="relative size-28 overflow-hidden rounded-full bg-brand-dark ring-4 ring-amber-400/70 shadow-[0_0_28px_5px_rgba(251,191,36,0.35)]">
          {coach.photoUrl ? (
            <Image src={coach.photoUrl} alt={coach.name} fill sizes="112px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-brand-light font-display text-3xl font-bold text-brand">
              {coach.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("")}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-brand-dark/90 py-1">
            <Image src="/images/spartan-logo.jpeg" alt="" width={11} height={11} className="rounded-full" />
            <span className="text-[8px] font-black tracking-wider text-white">SPFC</span>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-white/40">Technical Staff</p>
      <p className="mt-2 font-display text-lg font-black uppercase tracking-wide text-white">
        {coach.name} <span className="text-white/40">—</span> {coach.position}{" "}
        <span className="text-white/40">#{getJerseyLabel(coach)}</span>
      </p>
      {summary && <p className="mt-3 text-sm leading-relaxed text-white/50">{summary}</p>}

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-gray-900">COACH</span>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-black text-white">SPFC STAFF</span>
      </div>
    </div>
  );
}

export function SquadPosterView({ poster, seasons }: { poster: SquadPosterData; seasons: string[] }) {
  const byGroup = new Map<PositionGroup, SquadPosterPlayer[]>();
  for (const group of POSITION_GROUPS) byGroup.set(group, []);
  const staff: SquadPosterPlayer[] = [];

  for (const player of poster.players) {
    if (player.positionGroup === STAFF_GROUP) {
      staff.push(player);
      continue;
    }
    const group = (player.positionGroup as PositionGroup) in GROUP_LABEL ? (player.positionGroup as PositionGroup) : "Midfielder";
    byGroup.get(group)?.push(player);
  }
  for (const list of byGroup.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  staff.sort((a, b) => a.name.localeCompare(b.name));

  const playerCount = poster.players.length - staff.length;

  return (
    <div className="relative overflow-hidden bg-[#0b0714] pb-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="pointer-events-none absolute -right-24 top-0 size-72 rounded-full bg-brand/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-1/3 size-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-4 pt-4 sm:px-6 lg:max-w-6xl">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-end gap-2">
          <Button
            href={`/api/squad-poster/pdf?season=${poster.season}`}
            native
            variant="inverse"
            size="sm"
            leftIcon={<FileDown className="size-4" />}
          >
            Download PDF
          </Button>
          <SeasonSwitcher seasons={seasons} current={poster.season} showAllOption={false} />
        </div>

        <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center text-center">
          <Image
            src="/images/spartan-logo.jpeg"
            alt="Spartan FC crest"
            width={88}
            height={88}
            className="mb-4 rounded-full ring-4 ring-white/10"
          />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Official Presentation</p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white">
            Spartan Football Club
          </h1>
          <p className="mt-1 font-display text-lg font-bold text-sky-300">{poster.season} Official Squad</p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-gray-900">
              {playerCount} PLAYERS
            </span>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-black text-white">ELITE SQUAD</span>
          </div>

          {!poster.isLive && (
            <p className="mt-4 max-w-xs text-xs text-white/40">
              Archived squad — shown exactly as it stood for the {poster.season} season.
            </p>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-10">
          {POSITION_GROUPS.map((group) => {
            const players = byGroup.get(group) ?? [];
            if (players.length === 0) return null;
            const style = GROUP_STYLE[group];
            return (
              <div key={group}>
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("h-5 w-1 rounded-full", style.bar)} />
                    <h2 className="font-display text-lg font-black uppercase tracking-wide text-white">
                      {GROUP_LABEL[group]}
                    </h2>
                  </div>
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                    {players.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {players.map((player) => (
                    <PosterPlayerCard key={player.playerId} player={player} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {staff.length > 0 && (
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="mb-4 flex items-center justify-center gap-2.5">
              <span className="h-5 w-1 rounded-full bg-amber-400" />
              <h2 className="font-display text-lg font-black uppercase tracking-wide text-white">
                Technical Staff
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              {staff.map((coach) => (
                <TechnicalStaffCard
                  key={coach.playerId}
                  coach={coach}
                  summary={
                    staff.length > 1
                      ? coach.bio
                      : `Leading the Spartans into ${poster.season} with discipline, flair and the relentless Spartan spirit. Tactical mastermind behind the ${playerCount}-man elite roster.`
                  }
                />
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-2 border-t border-white/10 pt-8 text-center">
          <div className="flex items-center gap-2">
            <Image src="/images/spartan-logo.jpeg" alt="" width={28} height={28} className="rounded-full" />
            <div className="text-left">
              <p className="font-display text-sm font-black text-white">SPARTAN FC</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-white/40">
            {poster.season} Season <span className="text-white/20">•</span>{" "}
            <span className="text-accent">#UpTheSpartans</span>
          </p>
          <p className="text-xs font-bold uppercase tracking-wide text-white/30">
            {playerCount} Players • 1 Vision
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/20">
            Official Squad Poster • Spartan Hub
          </p>
        </div>
      </div>
    </div>
  );
}
