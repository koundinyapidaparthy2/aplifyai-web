import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS, Job } from '@/types/firestore';
import { startOfWeek, subWeeks, format } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();

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

        // Get all resumes
        const resumesSnapshot = await adminDb
            .collection(COLLECTIONS.RESUMES)
            .where('userId', '==', user.userId)
            .get();

        // Get all cover letters
        const coverLettersSnapshot = await adminDb
            .collection(COLLECTIONS.COVER_LETTERS)
            .where('userId', '==', user.userId)
            .get();

        // Calculate statistics
        const totalApplications = jobs.length;
        const totalResumes = resumesSnapshot.size;
        const totalCoverLetters = coverLettersSnapshot.size;

        // Status breakdown
        const statusBreakdown: Record<string, number> = {
            draft: 0,
            applied: 0,
            interview: 0,
            offer: 0,
            rejected: 0,
        };

        jobs.forEach(job => {
            const status = job.status || 'draft';
            statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
        });

        // Weekly trend (last 4 weeks)
        const weeklyTrend: { week: string; count: number }[] = [];
        const now = new Date();

        for (let i = 3; i >= 0; i--) {
            const weekStart = startOfWeek(subWeeks(now, i));
            const weekEnd = startOfWeek(subWeeks(now, i - 1));

            const count = jobs.filter(job => {
                const jobDate = job.createdAt;
                return jobDate >= weekStart && jobDate < weekEnd;
            }).length;

            weeklyTrend.push({
                week: format(weekStart, 'MMM d'),
                count,
            });
        }

        // Success rate (offers / total applications)
        const successRate = totalApplications > 0
            ? ((statusBreakdown.offer / totalApplications) * 100).toFixed(1)
            : '0.0';

        // Average response time (simplified - days between applied and interview/offer)
        const responseTimes: number[] = [];
        jobs.forEach(job => {
            if (job.appliedDate && (job.status === 'interview' || job.status === 'offer')) {
                const appliedDate = (job.appliedDate as any)?.toDate?.() || new Date(job.appliedDate!);
                const updatedDate = (job.updatedAt as any)?.toDate?.() || new Date(job.updatedAt);
                const daysDiff = Math.floor((updatedDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff > 0) {
                    responseTimes.push(daysDiff);
                }
            }
        });

        const avgResponseTime = responseTimes.length > 0
            ? `${Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)} days`
            : 'N/A';

        return NextResponse.json({
            success: true,
            stats: {
                totalApplications,
                totalResumes,
                totalCoverLetters,
                statusBreakdown,
                weeklyTrend,
                successRate: parseFloat(successRate),
                avgResponseTime,
            },
        });
    } catch (error: any) {
        console.error('Get stats error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to get stats' },
            { status: 500 }
        );
    }
}
