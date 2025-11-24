import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
    id: string;
    type: 'resume_generated' | 'cover_letter_generated' | 'job_created' | 'job_status_updated';
    title: string;
    description?: string;
    timestamp: Date;
    metadata?: any;
}

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const activities: Activity[] = [];

        // Get recent resumes
        const resumesSnapshot = await adminDb
            .collection(COLLECTIONS.RESUMES)
            .where('userId', '==', user.userId)
            .limit(limit)
            .get();

        resumesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            activities.push({
                id: `resume-${doc.id}`,
                type: 'resume_generated',
                title: `Generated resume for ${data.companyName}`,
                description: data.jobTitle,
                timestamp: data.createdAt?.toDate?.() || new Date(data.createdAt),
                metadata: {
                    companyName: data.companyName,
                    jobTitle: data.jobTitle,
                    resumeId: doc.id,
                },
            });
        });

        // Get recent cover letters
        const coverLettersSnapshot = await adminDb
            .collection(COLLECTIONS.COVER_LETTERS)
            .where('userId', '==', user.userId)
            .limit(limit)
            .get();

        coverLettersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            activities.push({
                id: `cover-letter-${doc.id}`,
                type: 'cover_letter_generated',
                title: `Generated cover letter for ${data.companyName}`,
                description: data.jobTitle,
                timestamp: data.createdAt?.toDate?.() || new Date(data.createdAt),
                metadata: {
                    companyName: data.companyName,
                    jobTitle: data.jobTitle,
                    coverLetterId: doc.id,
                },
            });
        });

        // Get recent jobs
        const jobsSnapshot = await adminDb
            .collection(COLLECTIONS.JOBS)
            .where('userId', '==', user.userId)
            .limit(limit)
            .get();

        jobsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
            const updatedAt = data.updatedAt?.toDate?.() || new Date(data.updatedAt);

            // Job created activity
            activities.push({
                id: `job-created-${doc.id}`,
                type: 'job_created',
                title: `Created job application`,
                description: `${data.companyName} - ${data.jobTitle}`,
                timestamp: createdAt,
                metadata: {
                    companyName: data.companyName,
                    jobTitle: data.jobTitle,
                    jobId: doc.id,
                },
            });

            // Job status updated (if different from created time)
            if (updatedAt.getTime() !== createdAt.getTime() && data.status !== 'draft') {
                activities.push({
                    id: `job-updated-${doc.id}`,
                    type: 'job_status_updated',
                    title: `Updated job status to ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
                    description: `${data.companyName} - ${data.jobTitle}`,
                    timestamp: updatedAt,
                    metadata: {
                        companyName: data.companyName,
                        jobTitle: data.jobTitle,
                        status: data.status,
                        jobId: doc.id,
                    },
                });
            }
        });

        // Sort by timestamp (newest first) and limit
        const sortedActivities = activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit)
            .map(activity => ({
                ...activity,
                timestamp: activity.timestamp.toISOString(),
                relativeTime: formatDistanceToNow(activity.timestamp, { addSuffix: true }),
            }));

        return NextResponse.json({
            success: true,
            count: sortedActivities.length,
            activities: sortedActivities,
        });
    } catch (error: any) {
        console.error('Get activity error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to get activity' },
            { status: 500 }
        );
    }
}
