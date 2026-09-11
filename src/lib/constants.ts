export const POSITIONS = [
  "Goalkeeper",
  "Centre Back",
  "Full Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Winger",
  "Striker",
] as const;

export type Position = (typeof POSITIONS)[number];

export const POSITION_GROUPS = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
] as const;

export type PositionGroup = (typeof POSITION_GROUPS)[number];

/** Every specific position rolls up to one of the four broad groups, used for filter chips. */
export const POSITION_TO_GROUP: Record<Position, PositionGroup> = {
  Goalkeeper: "Goalkeeper",
  "Centre Back": "Defender",
  "Full Back": "Defender",
  "Defensive Midfielder": "Midfielder",
  "Central Midfielder": "Midfielder",
  "Attacking Midfielder": "Midfielder",
  Winger: "Forward",
  Striker: "Forward",
};

export const PLAYER_STATUSES = ["active", "inactive"] as const;
export type PlayerStatus = (typeof PLAYER_STATUSES)[number];

export const SESSION_TYPES = ["training", "match"] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

/** Only meaningful for matches, and only ever set when the admin chooses to record it. */
export const MATCH_OUTCOMES = ["win", "draw", "loss"] as const;
export type MatchOutcome = (typeof MATCH_OUTCOMES)[number];
