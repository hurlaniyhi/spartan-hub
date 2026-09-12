import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { readFile } from "fs/promises";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireAdmin } from "@/lib/require-admin";
import { getStatisticsAsOf } from "@/lib/reports";
import { StatisticsReportDocument } from "@/lib/pdf/StatisticsReportDocument";

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

  const logo = await readFile(path.join(process.cwd(), "public/images/spartan-logo.jpeg"));

  const buffer = await renderToBuffer(
    <StatisticsReportDocument
      rows={report.rows}
      cutoffDate={report.cutoffDate}
      seasonLabel={report.seasonLabel}
      trainingSessions={report.trainingSessions}
      matches={report.matches}
      totalSessions={report.totalSessions}
      logo={logo}
    />
  );

  const cutoffLabel = format(report.cutoffDate, "yyyy-MM-dd");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="spartan-fc-statistics-${cutoffLabel}.pdf"`,
    },
  });
}
