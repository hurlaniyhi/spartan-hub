"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileDown } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function DateExportForm() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input id="export-date" type="date" label="As of date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <Button
        href={`/api/reports/export?date=${date}`}
        native
        variant="outline"
        leftIcon={<FileDown className="size-4" />}
      >
        Download CSV
      </Button>
    </div>
  );
}
