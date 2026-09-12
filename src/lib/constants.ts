export const POSITIONS = [
  "Goalkeeper",
  "Centre Back",
  "Full Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Winger",
  "Striker",
  "Coach",
] as const;

export type Position = (typeof POSITIONS)[number];

/** The four playing positions a squad is organized into — used for filter
 * chips and squad-poster sections. Deliberately doesn't include the coach's
 * "Staff" group, which gets its own dedicated treatment wherever it matters
 * (see STAFF_GROUP) rather than being just another filterable chip. */
export const POSITION_GROUPS = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
] as const;

export type PositionGroup = (typeof POSITION_GROUPS)[number];

/** Non-playing staff, e.g. a coach — distinct from the four playing groups above. */
export const STAFF_GROUP = "Staff" as const;

export type AnyPositionGroup = PositionGroup | typeof STAFF_GROUP;

/** Every value `positionGroup` can actually hold in the database — the Player schema's enum. */
export const ALL_POSITION_GROUPS = [...POSITION_GROUPS, STAFF_GROUP] as const;

/** Every specific position rolls up to one of the four broad playing groups, or to Staff for a coach. */
export const POSITION_TO_GROUP: Record<Position, AnyPositionGroup> = {
  Goalkeeper: "Goalkeeper",
  "Centre Back": "Defender",
  "Full Back": "Defender",
  "Defensive Midfielder": "Midfielder",
  "Central Midfielder": "Midfielder",
  "Attacking Midfielder": "Midfielder",
  Winger: "Forward",
  Striker: "Forward",
  Coach: STAFF_GROUP,
};

export const PLAYER_STATUSES = ["active", "inactive"] as const;
export type PlayerStatus = (typeof PLAYER_STATUSES)[number];

export const SESSION_TYPES = ["training", "match"] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

/** Only meaningful for matches, and only ever set when the admin chooses to record it. */
export const MATCH_OUTCOMES = ["win", "draw", "loss"] as const;
export type MatchOutcome = (typeof MATCH_OUTCOMES)[number];
