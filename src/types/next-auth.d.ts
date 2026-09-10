import type { DefaultSession } from "@auth/core/types";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "admin";
  }
}
