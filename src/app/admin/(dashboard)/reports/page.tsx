import { FileDown, FileText, CalendarDays } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DateExportForm } from "@/components/admin/DateExportForm";
import { getSessionSummaries } from "@/lib/stats";
import { formatSessionDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const sessions = await getSessionSummaries();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Download Spartan FC statistics as a CSV or PDF — the totals reflect standings at that point in time.
        </p>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-bold text-gray-900">Current Statistics</p>
            <p className="text-sm text-gray-500">Every session recorded so far.</p>
          </div>
          <div className="flex gap-2">
            <Button href="/api/reports/export" native variant="outline" leftIcon={<FileDown className="size-4" />}>
              CSV
            </Button>
            <Button href="/api/reports/export/pdf" native variant="accent" leftIcon={<FileText className="size-4" />}>
              PDF
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="mb-3 font-display text-base font-bold text-gray-900">Statistics As Of a Date</p>
          <DateExportForm />
        </CardBody>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-base font-bold text-gray-900">Statistics As Of a Session</h2>
        {sessions.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No sessions yet" description="Record a session to export a report for it." />
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((session) => (
              <Card key={session.sessionId}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={session.type === "match" ? "accent" : "brand"}>{session.type}</Badge>
                    <span className="text-sm font-medium text-gray-700">
                      {formatSessionDate(session.date)}
                      {session.opponent ? ` vs ${session.opponent}` : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      href={`/api/reports/export?sessionId=${session.sessionId}`}
                      native
                      variant="outline"
                      size="sm"
                      leftIcon={<FileDown className="size-3.5" />}
                    >
                      CSV
                    </Button>
                    <Button
                      href={`/api/reports/export/pdf?sessionId=${session.sessionId}`}
                      native
                      variant="accent"
                      size="sm"
                      leftIcon={<FileText className="size-3.5" />}
                    >
                      PDF
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
