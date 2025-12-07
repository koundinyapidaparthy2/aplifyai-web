import NextAuth from "next-auth";
import { adminDb } from "./firebase-admin";
import { COLLECTIONS } from "@/types/firestore";
import { authConfig } from "./auth.config";

export const authOptions = {
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }: any) {
            try {
                if (!user.email) return false;

                const usersRef = adminDb.collection(COLLECTIONS.USERS);
                const userQuery = await usersRef.where("email", "==", user.email).get();

                let userId: string;

                if (userQuery.empty) {
                    // Create new user
                    const userDoc = {
                        email: user.email.toLowerCase(),
                        firstName: user.name?.split(" ")[0] || undefined,
                        lastName: user.name?.split(" ").slice(1).join(" ") || undefined,
                        provider: account?.provider || "oauth",
                        providerId: account?.providerAccountId || undefined,
                        image: user.image || undefined,
                        onboardingComplete: false,
                        onboardingStep: 0,
                        emailVerified: true, // OAuth emails are pre-verified
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    // Remove undefined fields
                    Object.keys(userDoc).forEach((key) => {
                        if (userDoc[key as keyof typeof userDoc] === undefined) {
                            delete userDoc[key as keyof typeof userDoc];
                        }
                    });

                    const userRef = await usersRef.add(userDoc);
                    userId = userRef.id;

                    // Create empty profile
                    await adminDb.collection(COLLECTIONS.PROFILES).doc(userId).set({
                        userId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                } else {
                    // User exists, update last login
                    userId = userQuery.docs[0].id;
                    await usersRef.doc(userId).update({
                        updatedAt: new Date(),
                    });
                }

                // Store userId in the user object for JWT
                user.id = userId;
                // Store onboarding status for JWT
                if (!userQuery.empty) {
                    const userData = userQuery.docs[0].data();
                    user.onboardingComplete = userData.onboardingComplete;
                } else {
                    // New user
                    user.onboardingComplete = false;
                }

                return true;
            } catch (error) {
                console.error("OAuth sign in error:", error);
                // Allow sign in even if DB fails, but log it. 
                // In strict mode we might want to return false.
                return true;
            }
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.userId = user.id;
                token.email = user.email;
                token.onboardingComplete = user.onboardingComplete;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.userId;
                session.user.email = token.email;
                session.user.onboardingComplete = token.onboardingComplete;
            }
            return session;
        }
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
