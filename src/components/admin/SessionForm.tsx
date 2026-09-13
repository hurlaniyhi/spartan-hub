"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Dumbbell, Swords, Trophy, Handshake, ThumbsDown } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  PlayerPerformanceRow,
  type PerformanceState,
} from "@/components/admin/PlayerPerformanceRow";
import { saveSession } from "@/actions/sessions";
import type { SessionType, MatchOutcome } from "@/lib/constants";
import { cn } from "@/lib/cn";

export type RosterPlayer = { id: string; name: string; photoUrl?: string; position: string };

export type ExistingSessionData = {
  id: string;
  type: SessionType;
  date: string;
  opponent?: string;
  venue?: string;
  result?: string;
  outcome?: MatchOutcome;
  notes?: string;
  performances: Record<string, PerformanceState>;
};

const OUTCOME_OPTIONS: { value: MatchOutcome; label: string; icon: React.ReactNode }[] = [
  { value: "win", label: "Win", icon: <Trophy className="size-4" /> },
  { value: "draw", label: "Draw", icon: <Handshake className="size-4" /> },
  { value: "loss", label: "Loss", icon: <ThumbsDown className="size-4" /> },
];

export function SessionForm({
  roster,
  existingSession,
  defaultType = "training",
}: {
  roster: RosterPlayer[];
  existingSession?: ExistingSessionData;
  defaultType?: SessionType;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [type, setType] = useState<SessionType>(existingSession?.type ?? defaultType);
  const [date, setDate] = useState(existingSession?.date ?? format(new Date(), "yyyy-MM-dd"));
  const [opponent, setOpponent] = useState(existingSession?.opponent ?? "");
  const [venue, setVenue] = useState(existingSession?.venue ?? "");
  const [matchResult, setMatchResult] = useState(existingSession?.result ?? "");
  const [outcome, setOutcome] = useState<MatchOutcome | undefined>(existingSession?.outcome);
  const [notes, setNotes] = useState(existingSession?.notes ?? "");
  const [performances, setPerformances] = useState<Record<string, PerformanceState>>(() => {
    const initial: Record<string, PerformanceState> = {};
    for (const player of roster) {
      initial[player.id] = existingSession?.performances[player.id] ?? {
        attended: false,
        goals: 0,
        assists: 0,
      };
    }
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const values = Object.values(performances);
    return {
      present: values.filter((v) => v.attended).length,
      goals: values.reduce((sum, v) => sum + v.goals, 0),
      assists: values.reduce((sum, v) => sum + v.assists, 0),
    };
  }, [performances]);

  const updatePerformance = (playerId: string, next: PerformanceState) => {
    setPerformances((current) => ({ ...current, [playerId]: next }));
  };

  const handleSave = async () => {
    setDateError(null);
    if (!date) {
      setDateError("Please choose a date.");
      return;
    }

    setSubmitting(true);
    const actionResult = await saveSession(existingSession?.id ?? null, {
      session: {
        type,
        date,
        opponent: type === "match" ? opponent || undefined : undefined,
        venue: type === "match" ? venue || undefined : undefined,
        result: type === "match" ? matchResult || undefined : undefined,
        outcome: type === "match" ? outcome : undefined,
        notes: notes || undefined,
      },
      performances: roster.map((player) => ({
        playerId: player.id,
        ...performances[player.id],
      })),
    });
    setSubmitting(false);

    if (!actionResult.success) {
      if (actionResult.fieldErrors?.date) setDateError(actionResult.fieldErrors.date);
      showToast(actionResult.message, "error");
      return;
    }

    showToast(`${type === "training" ? "Training" : "Match"} recorded successfully.`);
    router.push(`/admin/sessions/${actionResult.data.id}`);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <Card>
        <CardBody className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-white/70">What happened today?</p>
            <div className="grid grid-cols-2 gap-3">
              <TypeButton
                active={type === "training"}
                icon={<Dumbbell className="size-5" />}
                label="Training"
                onClick={() => setType("training")}
              />
              <TypeButton
                active={type === "match"}
                icon={<Swords className="size-5" />}
                label="Match"
                onClick={() => setType("match")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="date"
              type="date"
              label="Date"
              value={date}
              error={dateError ?? undefined}
              onChange={(event) => setDate(event.target.value)}
            />
            {type === "match" && (
              <Input
                id="opponent"
                label="Opponent (optional)"
                placeholder="e.g. XYZ FC"
                value={opponent}
                onChange={(event) => setOpponent(event.target.value)}
              />
            )}
          </div>

          {type === "match" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="venue"
                label="Venue (optional)"
                value={venue}
                onChange={(event) => setVenue(event.target.value)}
              />
              <Input
                id="result"
                label="Result (optional)"
                placeholder="e.g. Spartan FC 4 - 2 XYZ FC"
                value={matchResult}
                onChange={(event) => setMatchResult(event.target.value)}
              />
            </div>
          )}

          {type === "match" && (
            <div>
              <p className="mb-2 text-sm font-semibold text-white/70">
                Outcome <span className="font-normal text-white/30">(optional)</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {OUTCOME_OPTIONS.map((option) => {
                  const active = outcome === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setOutcome(active ? undefined : option.value)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 text-sm font-semibold transition-colors",
                        active
                          ? option.value === "win"
                            ? "border-emerald-400 bg-emerald-400/15 text-emerald-300"
                            : option.value === "loss"
                              ? "border-accent bg-accent/15 text-red-300"
                              : "border-white/30 bg-white/10 text-white/80"
                          : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                      )}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-white/30">
                Tap again to clear. Only used to tally each player&apos;s win/draw/loss record —
                leave it blank if you&apos;d rather not track it.
              </p>
            </div>
          )}

          <Textarea
            id="notes"
            label="Notes (optional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="mb-1 font-display text-base font-bold text-white">Player Performance</p>
          <p className="mb-2 text-sm text-white/50">
            Mark who was present, then use the +/- buttons for goals and assists.
          </p>
          {roster.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/50">
              No active players to record yet — add players first.
            </p>
          ) : (
            <div>
              {roster.map((player) => (
                <PlayerPerformanceRow
                  key={player.id}
                  player={player}
                  performance={performances[player.id]}
                  onChange={(next) => updatePerformance(player.id, next)}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-sm font-medium text-white/60">
            <strong className="text-white">{summary.present}</strong> Present ·{" "}
            <strong className="text-white">{summary.goals}</strong> Goals ·{" "}
            <strong className="text-white">{summary.assists}</strong> Assists
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" href="/admin/sessions">
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSave} loading={submitting}>
              Save {type === "training" ? "Training" : "Match"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-2xl border-2 py-4 text-sm font-bold transition-colors",
        active
          ? "border-brand bg-brand/20 text-white"
          : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
