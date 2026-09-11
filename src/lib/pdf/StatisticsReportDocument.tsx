import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import type { ReportRow } from "@/lib/reports";

// Sampled directly from the Spartan FC crest — kept in sync with globals.css.
const BRAND = "#2905A3";
const BRAND_DARK = "#170363";
const ACCENT = "#DB261D";
const RANK_COLORS = ["#F5B301", "#B8B8B8", "#C97A3E"]; // gold, silver, bronze

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1F2937",
    paddingBottom: 48,
  },
  header: {
    backgroundColor: BRAND_DARK,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  crest: { width: 46, height: 46, borderRadius: 23 },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 11, color: "#C9C3F2", marginTop: 2 },
  accentBar: { height: 4, backgroundColor: ACCENT },
  body: { paddingHorizontal: 40, paddingTop: 24 },
  summaryRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  summaryValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: BRAND_DARK },
  summaryLabel: { fontSize: 8, color: "#6B7280", marginTop: 2, textTransform: "uppercase" },
  table: { borderRadius: 6, overflow: "hidden" },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: BRAND_DARK,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEBFB",
    alignItems: "center",
  },
  tableRowAlt: { backgroundColor: "#FAFAFF" },
  rankBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  rankBadgeText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  rankText: { fontSize: 9, color: "#9CA3AF" },
  colRank: { width: 30, flexDirection: "row", alignItems: "center" },
  colName: { flex: 1, fontFamily: "Helvetica-Bold", color: "#111827" },
  colStat: { width: 70, textAlign: "center" },
  goalsText: { color: BRAND_DARK, fontFamily: "Helvetica-Bold" },
  assistsText: { color: ACCENT, fontFamily: "Helvetica-Bold" },
  gaText: { color: "#111827", fontFamily: "Helvetica-Bold" },
  emptyState: {
    textAlign: "center",
    color: "#9CA3AF",
    paddingVertical: 40,
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9CA3AF",
  },
});

export function StatisticsReportDocument({
  rows,
  cutoffDate,
  seasonLabel,
  logo,
}: {
  rows: ReportRow[];
  cutoffDate: Date;
  seasonLabel: string;
  logo: Buffer;
}) {
  const totals = rows.reduce(
    (acc, row) => ({
      appearances: acc.appearances + row.appearances,
      goals: acc.goals + row.goals,
      assists: acc.assists + row.assists,
    }),
    { appearances: 0, goals: 0, assists: 0 }
  );

  return (
    <Document
      title={`Spartan FC Statistics — ${seasonLabel} — ${format(cutoffDate, "d MMMM yyyy")}`}
      author="Spartan Hub"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- this is @react-pdf/renderer's Image, not an HTML img */}
          <Image src={logo} style={styles.crest} />
          <View>
            <Text style={styles.headerTitle}>SPARTAN FC</Text>
            <Text style={styles.headerSubtitle}>
              {seasonLabel} · Statistics as of {format(cutoffDate, "d MMMM yyyy")}
            </Text>
          </View>
        </View>
        <View style={styles.accentBar} />

        <View style={styles.body}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{rows.length}</Text>
              <Text style={styles.summaryLabel}>Players</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{totals.appearances}</Text>
              <Text style={styles.summaryLabel}>Appearances</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: BRAND }]}>{totals.goals}</Text>
              <Text style={styles.summaryLabel}>Total Goals</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: ACCENT }]}>{totals.assists}</Text>
              <Text style={styles.summaryLabel}>Total Assists</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colRank]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colName]}>Player</Text>
              <Text style={[styles.tableHeaderCell, styles.colStat]}>Apps</Text>
              <Text style={[styles.tableHeaderCell, styles.colStat]}>Goals</Text>
              <Text style={[styles.tableHeaderCell, styles.colStat]}>Assists</Text>
              <Text style={[styles.tableHeaderCell, styles.colStat]}>G/A</Text>
            </View>

            {rows.length === 0 ? (
              <Text style={styles.emptyState}>No statistics recorded yet.</Text>
            ) : (
              rows.map((row, index) => (
                <View
                  key={row.name}
                  style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : undefined]}
                  wrap={false}
                >
                  <View style={styles.colRank}>
                    {index < 3 ? (
                      <View style={[styles.rankBadge, { backgroundColor: RANK_COLORS[index] }]}>
                        <Text style={styles.rankBadgeText}>{index + 1}</Text>
                      </View>
                    ) : (
                      <Text style={styles.rankText}>{index + 1}</Text>
                    )}
                  </View>
                  <Text style={styles.colName}>{row.name}</Text>
                  <Text style={styles.colStat}>{row.appearances}</Text>
                  <Text style={[styles.colStat, styles.goalsText]}>{row.goals}</Text>
                  <Text style={[styles.colStat, styles.assistsText]}>{row.assists}</Text>
                  <Text style={[styles.colStat, styles.gaText]}>{row.goalInvolvements}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Spartan FC — More Than a Team.</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
