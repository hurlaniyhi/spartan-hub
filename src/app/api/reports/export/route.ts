import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { requireAdmin } from "@/lib/require-admin";
import { getStatisticsAsOf } from "@/lib/reports";
import { toCsv } from "@/lib/csv";

export async function GET(request: NextRequest) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const report = await getStatisticsAsOf({
    sessionId: searchParams.get("sessionId"),
    date: searchParams.get("date"),
    season: searchParams.get("season"),
  });

  if (!report) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const cutoffLabel = format(report.cutoffDate, "yyyy-MM-dd");
  const csv = toCsv([
    [`Spartan FC Statistics — ${report.seasonLabel} — ${format(report.cutoffDate, "d MMMM yyyy")}`],
    [],
    ["Player", "Appearances", "Goals", "Assists", "G/A", "Wins", "Draws", "Losses"],
    ...report.rows.map((row) => [
      row.name,
      row.appearances,
      row.goals,
      row.assists,
      row.goalInvolvements,
      row.wins,
      row.draws,
      row.losses,
    ]),
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="spartan-fc-statistics-${cutoffLabel}.csv"`,
    },
  });
}
