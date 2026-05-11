import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/signup");
      const isOnApp =
        nextUrl.pathname.startsWith("/app") ||
        nextUrl.pathname === "/dashboard" ||
        nextUrl.pathname.startsWith("/projects");

      if (isOnApp) {
        if (isLoggedIn) return true;
        return false; // redirected to /login
      }
      if (isOnAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/app", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // populated in auth.ts (Node runtime only)
} satisfies NextAuthConfig;
