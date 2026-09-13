"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { saveLegacyTeamSummary } from "@/actions/legacy";
import type { LegacyTeamTotals } from "@/lib/stats";

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/30">{label}</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 text-center text-sm font-semibold text-white focus:border-brand-light focus:outline-none focus:ring-2 focus:ring-brand/30 sm:w-24"
      />
    </label>
  );
}

export function LegacyTeamSummaryForm({ season, summary }: { season: string; summary: LegacyTeamTotals }) {
  const { showToast } = useToast();
  const [trainingSessions, setTrainingSessions] = useState(summary.trainingSessions);
  const [matches, setMatches] = useState(summary.matches);
  const [wins, setWins] = useState(summary.wins);
  const [draws, setDraws] = useState(summary.draws);
  const [losses, setLosses] = useState(summary.losses);
  const [submitting, setSubmitting] = useState(false);

  const dirty =
    trainingSessions !== summary.trainingSessions ||
    matches !== summary.matches ||
    wins !== summary.wins ||
    draws !== summary.draws ||
    losses !== summary.losses;

  const handleSave = async () => {
    setSubmitting(true);
    const result = await saveLegacyTeamSummary({ season, trainingSessions, matches, wins, draws, losses });
    setSubmitting(false);

    if (!result.success) {
      showToast(result.message, "error");
      return;
    }
    showToast(`Team totals for ${season} saved.`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4">
        <NumberField label="Trainings" value={trainingSessions} onChange={setTrainingSessions} />
        <NumberField label="Matches" value={matches} onChange={setMatches} />
        <NumberField label="Wins" value={wins} onChange={setWins} />
        <NumberField label="Draws" value={draws} onChange={setDraws} />
        <NumberField label="Losses" value={losses} onChange={setLosses} />
      </div>
      <div>
        <Button size="sm" variant={dirty ? "accent" : "outline"} onClick={handleSave} loading={submitting}>
          {dirty ? "Save Team Totals" : "Saved"}
        </Button>
      </div>
    </div>
  );
}
