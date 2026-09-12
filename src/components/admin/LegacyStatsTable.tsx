"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { saveLegacyRecord } from "@/actions/legacy";

export type LegacyRow = {
  playerId: string;
  name: string;
  photoUrl?: string;
  appearances: number;
  goals: number;
  assists: number;
};

export function LegacyStatsTable({ season, rows }: { season: string; rows: LegacyRow[] }) {
  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {rows.map((row) => (
        <LegacyStatsRow key={row.playerId} season={season} row={row} />
      ))}
    </div>
  );
}

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
    <label className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:hidden">
        {label}
      </span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        className="h-10 w-20 rounded-lg border border-gray-200 bg-white text-center text-sm font-semibold text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </label>
  );
}

function LegacyStatsRow({ season, row }: { season: string; row: LegacyRow }) {
  const { showToast } = useToast();
  const [appearances, setAppearances] = useState(row.appearances);
  const [goals, setGoals] = useState(row.goals);
  const [assists, setAssists] = useState(row.assists);
  const [saved, setSaved] = useState(row.appearances > 0 || row.goals > 0 || row.assists > 0);
  const [submitting, setSubmitting] = useState(false);

  const dirty = appearances !== row.appearances || goals !== row.goals || assists !== row.assists;

  const handleSave = async () => {
    setSubmitting(true);
    const result = await saveLegacyRecord({ playerId: row.playerId, season, appearances, goals, assists });
    setSubmitting(false);

    if (!result.success) {
      showToast(result.message, "error");
      return;
    }

    if (result.data.appearances !== appearances) setAppearances(result.data.appearances);
    setSaved(appearances > 0 || goals > 0 || assists > 0);
    showToast(`${row.name}'s ${season} legacy record saved.`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:basis-48">
        <PlayerAvatar photoUrl={row.photoUrl} name={row.name} size="sm" />
        <span className="truncate text-sm font-semibold text-gray-900">{row.name}</span>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-center">
        <NumberField label="Appearances" value={appearances} onChange={setAppearances} />
        <NumberField label="Goals" value={goals} onChange={setGoals} />
        <NumberField label="Assists" value={assists} onChange={setAssists} />
      </div>
      <Button
        size="sm"
        variant={dirty ? "accent" : "outline"}
        onClick={handleSave}
        loading={submitting}
        leftIcon={!dirty && saved ? <Check className="size-3.5" /> : undefined}
      >
        {dirty ? "Save" : saved ? "Saved" : "Save"}
      </Button>
    </div>
  );
}
