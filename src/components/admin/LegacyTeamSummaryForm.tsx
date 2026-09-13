"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/NumberField";
import { saveLegacyTeamSummary } from "@/actions/legacy";
import type { LegacyTeamTotals } from "@/lib/stats";

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
