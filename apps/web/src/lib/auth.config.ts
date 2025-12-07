import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import AppleProvider from "next-auth/providers/apple";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        CredentialsProvider({
            id: 'google-onetap',
            name: 'Google One Tap',
            credentials: {
                credential: { type: "text" }
            },
            async authorize(credentials) {
                const token = credentials?.credential as string;
                if (!token) return null;

                try {
                    // Verify the ID token via Google's tokeninfo endpoint
                    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
                    const data = await response.json();

                    if (!response.ok || data.aud !== process.env.GOOGLE_CLIENT_ID) {
                        console.error('Available client ID:', process.env.GOOGLE_CLIENT_ID);
                        console.error('Token verification failed:', data);
                        return null;
                    }

                    // Return user profile tailored for NextAuth
                    return {
                        id: data.sub,
                        name: data.name,
                        email: data.email,
                        image: data.picture,
                    };
                } catch (error) {
                    console.error('Google One Tap Auth Error:', error);
                    return null;
                }
            }
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
