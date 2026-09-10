import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { AdminModel } from "@/models/Admin";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  // Required once this runs outside `next dev`: Auth.js otherwise rejects
  // requests unless the host is on an explicit allowlist. The app is
  // protected by its own credentials + JWT check, not by host allowlisting,
  // so trusting the host Next.js itself already resolved the request against
  // is safe here.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        await connectToDatabase();
        const admin = await AdminModel.findOne({
          email: parsed.data.email.toLowerCase(),
        });
        if (!admin) return null;

        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          admin.passwordHash
        );
        if (!passwordMatches) return null;

        return {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role as "admin",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role ?? "admin";
      }
      return session;
    },
  },
});
