/**
 * One-off fix for sessions created before `season` switched from a
 * Jul–Jun football-season label (e.g. "2026/27") to a plain calendar year
 * (e.g. "2026"). Safe to run more than once — it just recomputes `season`
 * from each session's own `date`.
 */
import { connectToDatabase } from "../src/lib/db";
import { SessionModel } from "../src/models/Session";
import { seasonForDate } from "../src/lib/slugify";

async function main() {
  await connectToDatabase();
  const sessions = await SessionModel.find().select("_id date season");

  let updated = 0;
  for (const session of sessions) {
    const correctSeason = seasonForDate(session.date);
    if (session.season !== correctSeason) {
      session.season = correctSeason;
      await session.save();
      updated += 1;
    }
  }

  console.log(`Checked ${sessions.length} session(s), updated ${updated}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
