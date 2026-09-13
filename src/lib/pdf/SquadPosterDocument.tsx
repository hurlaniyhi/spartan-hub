import { Document, Page, View, Text, Image, Svg, Circle, StyleSheet } from "@react-pdf/renderer";
import { getJerseyLabel } from "@/lib/format";
import { POSITION_GROUPS, STAFF_GROUP, type PositionGroup } from "@/lib/constants";
import type { SquadPosterData, SquadPosterPlayer } from "@/lib/squad-poster";

const ACCENT = "#DB261D";
const BRAND = "#2905A3";
const GOLD = "#F5B301";
const BG = "#0b0714";

/**
 * A CSS px on the web page isn't a PDF pt (96px/inch vs 72pt/inch) — every
 * dimension below is this exact conversion of the web page's own Tailwind
 * values (at its mobile, 2-column layout — the reference the app itself
 * uses for "how it should look" per the original spec), not an eyeballed
 * guess. The page itself is sized like a phone screen for the same reason:
 * a phone-shaped page is what makes a mobile-sized card look right — a
 * correctly-sized card centered on a wide A4 sheet still reads as "wrong"
 * next to all that surrounding empty page.
 */
const PX = (px: number) => px * 0.75;

// Phone-screen width — the same reference the app's own mobile layout is
// designed against. Height is NOT a fixed phone-screen height: this is meant
// to read as one continuous infographic/poster, not a stack of "screens", so
// the page is instead sized tall enough to fit everything on one page (see
// estimatePageHeight below) rather than paginating like a normal document.
const PAGE_WIDTH = PX(390);
// The page's own outer gutter — matches the web layout's `px-4` container padding.
const PAGE_PADDING_X = PX(16);

// The web mobile layout's 2-column player card: (358px container - 16px gap) / 2.
const CARD_WIDTH = PX(171);
// The staff card fills its mobile container's full width (max-w-md only caps
// it on wider screens).
const STAFF_CARD_WIDTH = PX(358);
// Both card types use the same size-28 (112px) photo on the web.
const PHOTO_SIZE = PX(112);
// Matches the web's size-6 (24px) gold captain badge, overlapping the photo's bottom-right corner.
const CAPTAIN_BADGE_SIZE = PX(24);
// Matches the web's "-bottom-1 -right-1" offset (Tailwind's 1 = 4px): the badge
// hangs slightly outside the photo's corner rather than sitting flush inside it.
const CAPTAIN_BADGE_OFFSET = PX(4);

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

const GROUP_COLOR: Record<PositionGroup, string> = {
  Goalkeeper: GOLD,
  Defender: "#38BDF8",
  Midfielder: "#34D399",
  Forward: ACCENT,
};

// A rough word-wrap simulation (greedy, average-char-width based) used only
// to size the page tall enough up front — PDF pages can't auto-size to their
// content, and a real text layout isn't available before render. This
// deliberately overestimates a little (see LINE_HEIGHT_FACTOR /
// AVG_CHAR_WIDTH_FACTOR below and the flat safety buffer in
// estimatePageHeight): a bit of blank space at the bottom is fine, an
// unwanted page break is the thing this whole feature exists to avoid.
const AVG_CHAR_WIDTH_FACTOR = 0.52;
const LINE_HEIGHT_FACTOR = 1.3;

function estimateWrappedLines(text: string, fontSize: number, maxWidth: number): number {
  const charsPerLine = Math.max(1, Math.floor(maxWidth / (fontSize * AVG_CHAR_WIDTH_FACTOR)));
  const words = text.split(/\s+/).filter(Boolean);
  let lines = 1;
  let lineLength = 0;
  for (const word of words) {
    const wordLength = word.length + 1;
    if (lineLength > 0 && lineLength + wordLength > charsPerLine) {
      lines += 1;
      lineLength = wordLength;
    } else {
      lineLength += wordLength;
    }
  }
  return lines;
}

// Every constant here mirrors a style above — see the matching comment
// there for which Tailwind value it converts.
const HEADER_HEIGHT =
  PX(88) +
  PX(16) + // crest + its margin
  PX(12) * LINE_HEIGHT_FACTOR + // eyebrow
  PX(4) +
  PX(30) * LINE_HEIGHT_FACTOR + // title
  PX(4) +
  PX(18) * LINE_HEIGHT_FACTOR + // subtitle
  PX(16) +
  PX(4) * 2 +
  PX(12) * LINE_HEIGHT_FACTOR; // pills row
const ARCHIVED_NOTE_HEIGHT = PX(16) + PX(12) * LINE_HEIGHT_FACTOR * 2; // allow up to 2 lines
// Tallest child is the count bubble (size-8); staff's header omits it but
// reusing this is a safe overestimate rather than a separate, tighter one.
const SECTION_HEADER_HEIGHT = PX(12) + PX(16) + PX(32);
const CARD_HEIGHT =
  PX(14) + // pt-3.5
  PX(16) +
  PHOTO_SIZE +
  PX(12) + // photo block
  PX(16) * LINE_HEIGHT_FACTOR + // name
  PX(4) +
  PX(12) * LINE_HEIGHT_FACTOR + // meta
  PX(12) +
  1 +
  PX(12) +
  PX(4) + // divider + bar
  PX(16); // pb-4
const FOOTER_HEIGHT =
  PX(48) +
  PX(32) + // margin + padding
  PX(8) * 3 + // 3 gaps between the 4 footer lines
  PX(28) + // crest row
  PX(12) * LINE_HEIGHT_FACTOR +
  PX(12) * LINE_HEIGHT_FACTOR +
  PX(10) * LINE_HEIGHT_FACTOR;
// Generous flat cushion against the estimation slop above, so a slightly
// under-counted wrap never actually triggers a real page break.
const HEIGHT_SAFETY_BUFFER = 80;

function sectionHeight(playerCount: number): number {
  const rows = Math.ceil(playerCount / 2);
  return PX(40) + SECTION_HEADER_HEIGHT + rows * CARD_HEIGHT + Math.max(0, rows - 1) * PX(16);
}

function staffCardHeight(summary: string | undefined): number {
  const bioWidth = STAFF_CARD_WIDTH - PX(24) * 2;
  const bioLines = summary ? estimateWrappedLines(summary, PX(14), bioWidth) : 0;
  const bioHeight = summary ? PX(12) + bioLines * PX(14) * 1.4 : 0;
  return (
    PX(32) * 2 + // py-8
    PHOTO_SIZE +
    PX(20) + // photo + margin
    PX(12) * LINE_HEIGHT_FACTOR + // eyebrow
    PX(8) +
    PX(18) * LINE_HEIGHT_FACTOR + // title
    bioHeight +
    PX(20) +
    PX(4) * 2 +
    PX(12) * LINE_HEIGHT_FACTOR // pills row
  );
}

/** Total height needed to fit everything on one page — see the module doc above. */
function estimatePageHeight(params: {
  isLive: boolean;
  groupCounts: number[];
  staffSummaries: (string | undefined)[];
}): number {
  let total = PX(16) + PX(32) + HEADER_HEIGHT; // page's own top/bottom padding + header
  if (!params.isLive) total += ARCHIVED_NOTE_HEIGHT;
  for (const count of params.groupCounts) {
    if (count > 0) total += sectionHeight(count);
  }
  if (params.staffSummaries.length > 0) {
    total += PX(48) + SECTION_HEADER_HEIGHT;
    for (const summary of params.staffSummaries) {
      total += staffCardHeight(summary) + PX(24);
    }
  }
  total += FOOTER_HEIGHT;
  return total + HEIGHT_SAFETY_BUFFER;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG,
    color: "#FFFFFF",
    fontFamily: "Helvetica",
    paddingTop: PX(16),
    paddingBottom: PX(32),
    paddingHorizontal: PAGE_PADDING_X,
  },
  headerCrest: { width: PX(88), height: PX(88), borderRadius: PX(44), alignSelf: "center", marginBottom: PX(16) },
  eyebrow: {
    fontSize: PX(12), // text-xs
    letterSpacing: 2,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  title: {
    fontSize: PX(30), // text-3xl
    fontFamily: "Oswald",
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: PX(4), // mt-1
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: PX(18), // text-lg
    fontFamily: "Oswald",
    fontWeight: "bold",
    color: "#7DD3FC",
    textAlign: "center",
    marginTop: PX(4), // mt-1
  },
  pillsRow: { flexDirection: "row", justifyContent: "center", gap: PX(8), marginTop: PX(16) },
  // Used both on the page header and inside the staff card — identical
  // classes (px-3 py-1 text-xs font-black) in both spots on the web too.
  pillLight: {
    backgroundColor: "#FFFFFF",
    color: "#111827",
    fontSize: PX(12),
    fontFamily: "Helvetica-Bold",
    paddingVertical: PX(4),
    paddingHorizontal: PX(12),
    borderRadius: 10,
  },
  pillAccent: {
    backgroundColor: ACCENT,
    color: "#FFFFFF",
    fontSize: PX(12),
    fontFamily: "Helvetica-Bold",
    paddingVertical: PX(4),
    paddingHorizontal: PX(12),
    borderRadius: 10,
  },
  archivedNote: { fontSize: PX(12), color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: PX(16) },

  section: { marginTop: PX(40) }, // mt-10 / gap-10 between sections
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.14)",
    paddingBottom: PX(12), // pb-3
    marginBottom: PX(16), // mb-4
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: PX(10) }, // gap-2.5
  sectionBar: { width: PX(4), height: PX(20), borderRadius: 2 }, // h-5 w-1
  sectionTitle: { fontSize: PX(18), fontFamily: "Oswald", fontWeight: "bold", color: "#FFFFFF", textTransform: "uppercase" },
  sectionCount: {
    width: PX(32), // size-8
    height: PX(32),
    borderRadius: PX(16),
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    fontSize: PX(14), // text-sm
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: PX(9),
  },

  // Content width (page width minus the page's own gutter) is exactly
  // 2×CARD_WIDTH + gap, so this wraps to exactly 2 per row — the same
  // 2-column layout the mobile app uses — with no need to force it.
  cardsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", gap: PX(16) },
  card: {
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: PX(16), // rounded-2xl
    backgroundColor: "rgba(255,255,255,0.045)",
    paddingTop: PX(14), // pt-3.5
    paddingBottom: PX(16), // pb-4
    paddingHorizontal: PX(16), // px-4
    alignItems: "center",
    position: "relative",
  },
  // Absolutely positioned, like the web card — they overlay the top corners
  // rather than taking their own row, so they don't add extra card height.
  jerseyBadge: {
    position: "absolute",
    top: PX(14), // top-3.5
    left: PX(12), // left-3
    width: PX(28), // size-7
    height: PX(28),
    borderRadius: PX(14),
    backgroundColor: "#FFFFFF",
    color: "#111827",
    fontSize: PX(12), // text-xs
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: PX(6),
  },
  posBadge: {
    position: "absolute",
    top: PX(14),
    right: PX(12),
    fontSize: PX(10), // text-[10px]
    fontFamily: "Helvetica-Bold",
    color: "rgba(255,255,255,0.85)",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: PX(2), // py-0.5
    paddingHorizontal: PX(6), // px-1.5
    borderRadius: 3,
  },
  // Hangs off the photo circle's bottom-right corner by CAPTAIN_BADGE_OFFSET,
  // matching the web card's "-bottom-1 -right-1" placement exactly: top/left
  // offset to that corner (PX(30) + PHOTO_SIZE / PX(29.5) + PHOTO_SIZE, from
  // the photo-wrapper's marginTop/card padding) plus the offset, minus the
  // badge's own size.
  captainBadge: {
    position: "absolute",
    top: PX(30) + PHOTO_SIZE + CAPTAIN_BADGE_OFFSET - CAPTAIN_BADGE_SIZE,
    left: PX(29.5) + PHOTO_SIZE + CAPTAIN_BADGE_OFFSET - CAPTAIN_BADGE_SIZE,
    width: CAPTAIN_BADGE_SIZE,
    height: CAPTAIN_BADGE_SIZE,
    borderRadius: CAPTAIN_BADGE_SIZE / 2,
    backgroundColor: "#FBBF24",
    color: "#111827",
    fontSize: PX(11),
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: PX(5),
    borderWidth: 1.5,
    borderColor: "#0b0714",
  },
  initialsFill: { backgroundColor: BRAND, alignItems: "center", justifyContent: "center" },
  initialsText: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  photoBadgeBand: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: "rgba(23,3,99,0.92)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  photoBadgeCrest: { width: 7, height: 7, borderRadius: 3.5 },
  photoBadgeText: { fontSize: 5, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  name: {
    fontSize: PX(16), // text-base
    fontFamily: "Oswald",
    fontWeight: "bold",
    color: "#FFFFFF",
    textTransform: "uppercase",
    textAlign: "center",
  },
  meta: { fontSize: PX(12), color: "rgba(255,255,255,0.5)", marginTop: PX(4) }, // text-xs, mt-1
  divider: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    marginTop: PX(12), // mt-3
    paddingTop: PX(12), // pt-3
    alignItems: "center",
  },
  accentBar: { width: PX(64), height: PX(4), borderRadius: 2 }, // h-1 w-16

  staffSection: { marginTop: PX(48), alignItems: "center" }, // mt-12
  staffCard: {
    width: STAFF_CARD_WIDTH,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: PX(16), // rounded-2xl
    backgroundColor: "rgba(255,255,255,0.045)",
    paddingVertical: PX(32), // py-8
    paddingHorizontal: PX(24), // px-6
    alignItems: "center",
  },
  staffEyebrow: {
    fontSize: PX(12),
    letterSpacing: 2,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  staffTitle: {
    fontSize: PX(18), // text-lg
    fontFamily: "Oswald",
    fontWeight: "bold",
    color: "#FFFFFF",
    textTransform: "uppercase",
    marginTop: PX(8), // mt-2
    textAlign: "center",
  },
  staffBio: {
    fontSize: PX(14), // text-sm
    color: "rgba(255,255,255,0.5)",
    marginTop: PX(12), // mt-3
    textAlign: "center",
    lineHeight: 1.4,
  },

  footer: {
    marginTop: PX(48), // mt-12
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    paddingTop: PX(32), // pt-8
    alignItems: "center",
    gap: PX(8), // gap-2 between every footer line
  },
  footerCrestRow: { flexDirection: "row", alignItems: "center", gap: PX(8) },
  footerCrest: { width: PX(28), height: PX(28), borderRadius: PX(14) },
  footerClub: { fontSize: PX(14), fontFamily: "Oswald", fontWeight: "bold", color: "#FFFFFF" },
  footerLine: { fontSize: PX(12), color: "rgba(255,255,255,0.45)" },
  footerLine2: { fontSize: PX(12), fontFamily: "Helvetica-Bold", color: "rgba(255,255,255,0.32)", textTransform: "uppercase" },
  footerLine3: { fontSize: PX(10), color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: 1 },
});

/**
 * Mirrors the web photo's two effects: a crisp `ring-4 ring-{color}/70` sitting
 * flush against the circle's edge, plus a soft `shadow-[0_0_26px_4px_...]`
 * glow further out. @react-pdf/renderer can't blur, so the glow is
 * approximated with two concentric, low-opacity fills instead of a real
 * gaussian falloff — everything here is drawn in an oversized Svg that
 * overlaps its siblings via a negative offset (like a real box-shadow/ring,
 * which paint outside the box without enlarging it), so the photo still
 * contributes exactly `size` to the card's layout height.
 */
function PhotoCircle({
  photoUrl,
  name,
  logo,
  size,
  color,
}: {
  photoUrl?: string;
  name: string;
  logo: Buffer;
  size: number;
  color: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const photoR = size / 2;
  const haloPad = 14;
  const halo = size + haloPad * 2;
  const center = halo / 2;

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <Svg width={halo} height={halo} style={{ position: "absolute", top: -haloPad, left: -haloPad }}>
        {/* Soft outer glow, two steps standing in for a real blur falloff. */}
        <Circle cx={center} cy={center} r={photoR + 12} fill={color} fillOpacity={0.1} />
        <Circle cx={center} cy={center} r={photoR + 7} fill={color} fillOpacity={0.2} />
        {/* The crisp ring itself — flush against the photo's edge, like ring-4. */}
        <Circle cx={center} cy={center} r={photoR + 2} stroke={color} strokeOpacity={0.7} strokeWidth={4} fill="none" />
      </Svg>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text -- this is @react-pdf/renderer's Image, not an HTML img
          <Image src={photoUrl} style={{ width: size, height: size }} />
        ) : (
          <View style={[styles.initialsFill, { width: size, height: size }]}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
        )}
        <View style={styles.photoBadgeBand}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- this is @react-pdf/renderer's Image, not an HTML img */}
          <Image src={logo} style={styles.photoBadgeCrest} />
          <Text style={styles.photoBadgeText}>SPFC</Text>
        </View>
      </View>
    </View>
  );
}

function PosterCard({ player, logo }: { player: SquadPosterPlayer; logo: Buffer }) {
  const color = GROUP_COLOR[player.positionGroup as PositionGroup] ?? GROUP_COLOR.Midfielder;
  const abbr = POSITION_ABBR[player.positionGroup as PositionGroup] ?? player.position.slice(0, 3).toUpperCase();

  return (
    <View style={styles.card} wrap={false}>
      <View style={{ marginTop: PX(16), marginBottom: PX(12) }}>
        <PhotoCircle photoUrl={player.photoUrl} name={player.name} logo={logo} size={PHOTO_SIZE} color={color} />
      </View>

      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.meta}>
        {abbr} • #{getJerseyLabel(player)}
      </Text>

      <View style={styles.divider}>
        <View style={[styles.accentBar, { backgroundColor: color }]} />
      </View>

      {/* Absolute + rendered last so they overlay the top corners on top of
         everything else, exactly like the web card's badges. */}
      <Text style={styles.jerseyBadge}>{getJerseyLabel(player)}</Text>
      <Text style={styles.posBadge}>{abbr}</Text>
      {player.isCaptain && <Text style={styles.captainBadge}>C</Text>}
    </View>
  );
}

function TechnicalStaffCard({
  coach,
  logo,
  summary,
}: {
  coach: SquadPosterPlayer;
  logo: Buffer;
  summary?: string;
}) {
  return (
    <View style={styles.staffCard} wrap={false}>
      <View style={{ marginBottom: PX(20) }}>
        <PhotoCircle photoUrl={coach.photoUrl} name={coach.name} logo={logo} size={PHOTO_SIZE} color={GOLD} />
      </View>
      <Text style={styles.staffEyebrow}>Technical Staff</Text>
      <Text style={styles.staffTitle}>
        {coach.name} — {coach.position} #{getJerseyLabel(coach)}
      </Text>
      {summary && <Text style={styles.staffBio}>{summary}</Text>}
      <View style={[styles.pillsRow, { marginTop: PX(20) }]}>
        <Text style={styles.pillLight}>COACH</Text>
        <Text style={styles.pillAccent}>SPFC STAFF</Text>
      </View>
    </View>
  );
}

export function SquadPosterDocument({ poster, logo }: { poster: SquadPosterData; logo: Buffer }) {
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
  for (const list of byGroup.values()) list.sort((a, b) => a.name.localeCompare(b.name));
  staff.sort((a, b) => a.name.localeCompare(b.name));

  const playerCount = poster.players.length - staff.length;
  const staffSummaries = staff.map((coach) =>
    staff.length > 1
      ? coach.bio
      : `Leading the Spartans into ${poster.season} with discipline, flair and the relentless Spartan spirit. Tactical mastermind behind the ${playerCount}-man elite roster.`
  );

  // No pagination — the page is sized up front to fit everything, so this
  // reads as one continuous poster/infographic rather than a document with
  // page breaks.
  const pageHeight = estimatePageHeight({
    isLive: poster.isLive,
    groupCounts: POSITION_GROUPS.map((group) => byGroup.get(group)?.length ?? 0),
    staffSummaries,
  });

  return (
    <Document title={`Spartan FC Squad Poster — ${poster.season}`} author="Spartan Hub">
      <Page size={{ width: PAGE_WIDTH, height: pageHeight }} style={styles.page}>
        {/* Soft color wash approximating the web page's blurred background
           blobs — react-pdf has no blur filter, so this trades the feathered
           edge for plain low-opacity fills at a similar size/position.
           `fixed` keeps it out of the pagination flow — without it, its
           full-page height was pushing all real content onto a second page. */}
        <Svg style={{ position: "absolute", top: 0, left: 0 }} width={PAGE_WIDTH} height={pageHeight} fixed>
          <Circle cx={PAGE_WIDTH - 20} cy={20} r={55} fill={BRAND} fillOpacity={0.16} />
          <Circle cx={10} cy={pageHeight * 0.25} r={55} fill={ACCENT} fillOpacity={0.12} />
          <Circle cx={PAGE_WIDTH - 15} cy={pageHeight * 0.6} r={55} fill={BRAND} fillOpacity={0.1} />
        </Svg>

        {/* eslint-disable-next-line jsx-a11y/alt-text -- this is @react-pdf/renderer's Image, not an HTML img */}
        <Image src={logo} style={styles.headerCrest} />
        <Text style={styles.eyebrow}>Official Presentation</Text>
        <Text style={styles.title}>Spartan Football Club</Text>
        <Text style={styles.subtitle}>{poster.season} Official Squad</Text>

        <View style={styles.pillsRow}>
          <Text style={styles.pillLight}>{playerCount} PLAYERS</Text>
          <Text style={styles.pillAccent}>ELITE SQUAD</Text>
        </View>

        {!poster.isLive && (
          <Text style={styles.archivedNote}>
            Archived squad — shown exactly as it stood for the {poster.season} season.
          </Text>
        )}

        {POSITION_GROUPS.map((group) => {
          const players = byGroup.get(group) ?? [];
          if (players.length === 0) return null;
          return (
            <View key={group} style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionBar, { backgroundColor: GROUP_COLOR[group] }]} />
                  <Text style={styles.sectionTitle}>{GROUP_LABEL[group]}</Text>
                </View>
                <Text style={styles.sectionCount}>{players.length}</Text>
              </View>
              <View style={styles.cardsRow}>
                {players.map((player) => (
                  <PosterCard key={player.playerId} player={player} logo={logo} />
                ))}
              </View>
            </View>
          );
        })}

        {staff.length > 0 && (
          <View style={styles.staffSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionBar, { backgroundColor: GOLD }]} />
                <Text style={styles.sectionTitle}>Technical Staff</Text>
              </View>
            </View>
            {staff.map((coach, index) => (
              <View key={coach.playerId} style={{ marginBottom: PX(24) }}>
                <TechnicalStaffCard coach={coach} logo={logo} summary={staffSummaries[index]} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.footerCrestRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- this is @react-pdf/renderer's Image, not an HTML img */}
            <Image src={logo} style={styles.footerCrest} />
            <Text style={styles.footerClub}>SPARTAN FC</Text>
          </View>
          <Text style={styles.footerLine}>{poster.season} Season • #UpTheSpartans</Text>
          <Text style={styles.footerLine2}>{playerCount} Players • 1 Vision</Text>
          <Text style={styles.footerLine3}>Official Squad Poster • Spartan Hub</Text>
        </View>
      </Page>
    </Document>
  );
}
