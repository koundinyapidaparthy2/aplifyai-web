import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS, Job } from '@/types/firestore';
import { subDays } from 'date-fns';

interface Insight {
    type: 'info' | 'warning' | 'success' | 'tip';
    title: string;
    message: string;
    action?: {
        text: string;
        url: string;
    };
}

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        const insights: Insight[] = [];

        // Get all jobs for the user
        const jobsSnapshot = await adminDb
            .collection(COLLECTIONS.JOBS)
            .where('userId', '==', user.userId)
            .get();

        const jobs = jobsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
        })) as unknown as Job[];

        const totalJobs = jobs.length;
        const draftJobs = jobs.filter(j => j.status === 'draft').length;
        const appliedJobs = jobs.filter(j => j.status === 'applied').length;
        const interviewJobs = jobs.filter(j => j.status === 'interview').length;
        const offerJobs = jobs.filter(j => j.status === 'offer').length;
        const rejectedJobs = jobs.filter(j => j.status === 'rejected').length;

        // Check for recent activity (last 7 days)
        const sevenDaysAgo = subDays(new Date(), 7);
        const recentJobs = jobs.filter(j => j.createdAt >= sevenDaysAgo);

        // Insight 1: Low activity warning
        if (recentJobs.length === 0 && totalJobs > 0) {
            insights.push({
                type: 'warning',
                title: 'Low Activity This Week',
                message: "You haven't created any job applications in the last 7 days. Stay consistent to increase your chances!",
                action: {
                    text: 'Create Resume',
                    url: '/resumes/new',
                },
            });
        }

        // Insight 2: Many drafts
        if (draftJobs >= 3) {
            insights.push({
                type: 'warning',
                title: 'Complete Your Draft Applications',
                message: `You have ${draftJobs} draft applications. Completing them will increase your job search momentum!`,
                action: {
                    text: 'View Jobs',
                    url: '/jobs',
                },
            });
        }

        // Insight 3: Great progress
        if (recentJobs.length >= 3) {
            insights.push({
                type: 'success',
                title: 'Great Progress!',
                message: `You've created ${recentJobs.length} applications this week. Keep up the excellent work!`,
            });
        }

        // Insight 4: Upcoming interviews
        if (interviewJobs > 0) {
            insights.push({
                type: 'info',
                title: 'Interview Preparation',
                message: `You have ${interviewJobs} interview${interviewJobs > 1 ? 's' : ''} scheduled. Make sure to prepare thoroughly!`,
                action: {
                    text: 'View Jobs',
                    url: '/jobs',
                },
            });
        }

        // Insight 5: Offers received
        if (offerJobs > 0) {
            insights.push({
                type: 'success',
                title: '🎉 Congratulations!',
                message: `You have ${offerJobs} job offer${offerJobs > 1 ? 's' : ''}! Review them carefully and make the best decision.`,
            });
        }

        // Insight 6: High rejection rate
        if (totalJobs >= 5 && rejectedJobs / totalJobs > 0.5) {
            insights.push({
                type: 'tip',
                title: 'Improve Your Success Rate',
                message: 'Your rejection rate is higher than average. Consider tailoring your resume more specifically to each job.',
                action: {
                    text: 'Update Profile',
                    url: '/onboarding',
                },
            });
        }

        // Insight 7: Getting started
        if (totalJobs === 0) {
            insights.push({
                type: 'info',
                title: 'Welcome to AplifyAI!',
                message: 'Start your job search journey by creating your first tailored resume.',
                action: {
                    text: 'Create Resume',
                    url: '/resumes/new',
                },
            });
        }

        // Insight 8: Consistency tip
        if (totalJobs >= 5 && recentJobs.length >= 2) {
            insights.push({
                type: 'tip',
                title: 'Stay Consistent',
                message: 'Applying to 2-3 jobs per day significantly increases your chances of landing interviews.',
            });
        }

        return NextResponse.json({
            success: true,
            count: insights.length,
            insights,
        });
    } catch (error: any) {
        console.error('Get insights error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to get insights' },
            { status: 500 }
        );
    }
}
