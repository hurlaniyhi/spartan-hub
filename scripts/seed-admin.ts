import bcrypt from "bcryptjs";
import { connectToDatabase } from "../src/lib/db";
import { AdminModel } from "../src/models/Admin";

async function main() {
  const name = process.env.ADMIN_NAME ?? "Spartan FC Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before running this script."
    );
    process.exit(1);
  }

  await connectToDatabase();
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await AdminModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email: email.toLowerCase(), passwordHash },
    { upsert: true, returnDocument: "after" }
  );

  console.log(`Admin account ready: ${admin.email}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
