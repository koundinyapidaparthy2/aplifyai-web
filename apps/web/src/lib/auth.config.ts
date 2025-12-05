import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AppleProvider from "next-auth/providers/apple";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        // GitHubProvider({
        //     clientId: process.env.GITHUB_CLIENT_ID ?? "",
        //     clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
        // }),
        // AppleProvider({
        //     clientId: process.env.APPLE_CLIENT_ID ?? "",
        //     clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
        // }),
    ],
    trustHost: true,
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.userId = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.userId;
                session.user.email = token.email;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
