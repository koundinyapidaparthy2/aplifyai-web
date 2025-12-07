import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's unique identifier */
            id: string
            /** Whether the user has completed onboarding */
            onboardingComplete?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        onboardingComplete?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        onboardingComplete?: boolean
    }
}
