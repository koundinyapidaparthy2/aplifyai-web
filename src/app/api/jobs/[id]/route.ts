import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/types/firestore';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await requireAuth();
        const body = await request.json();
        const jobId = id;

        // Get job to verify ownership
        const jobDoc = await adminDb.collection(COLLECTIONS.JOBS).doc(jobId).get();

        if (!jobDoc.exists) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        const jobData = jobDoc.data();
        if (jobData?.userId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Update job
        await jobDoc.ref.update({
            ...body,
            updatedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: 'Job updated successfully',
        });
    } catch (error: any) {
        console.error('Update job error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to update job' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await requireAuth();
        const jobId = id;

        // Get job to verify ownership
        const jobDoc = await adminDb.collection(COLLECTIONS.JOBS).doc(jobId).get();

        if (!jobDoc.exists) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        const jobData = jobDoc.data();
        if (jobData?.userId !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Delete job
        await jobDoc.ref.delete();

        return NextResponse.json({
            success: true,
            message: 'Job deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete job error:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to delete job' },
            { status: 500 }
        );
    }
}
