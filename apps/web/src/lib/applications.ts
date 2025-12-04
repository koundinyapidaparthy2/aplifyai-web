import { adminDb } from "./firebase-admin";
import { COLLECTIONS, Job, JobDocument } from "@/types/firestore";
import { Timestamp } from "firebase-admin/firestore";

export const applications = {
    /**
     * Add a new job application
     */
    async add(userId: string, data: Omit<JobDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
        const docRef = await adminDb.collection(COLLECTIONS.JOBS).add({
            ...data,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return docRef.id;
    },

    /**
     * Get all applications for a user
     */
    async getAll(userId: string) {
        const snapshot = await adminDb
            .collection(COLLECTIONS.JOBS)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Safely convert Timestamps to Dates
                appliedDate: data.appliedDate ? (data.appliedDate as Timestamp).toDate() : undefined,
                createdAt: (data.createdAt as Timestamp).toDate(),
                updatedAt: (data.updatedAt as Timestamp).toDate(),
            };
        }) as Job[];
    },

    /**
     * Update an application status
     */
    async updateStatus(id: string, status: JobDocument['status']) {
        await adminDb.collection(COLLECTIONS.JOBS).doc(id).update({
            status,
            updatedAt: new Date(),
        });
    },

    /**
     * Delete an application
     */
    async delete(id: string) {
        await adminDb.collection(COLLECTIONS.JOBS).doc(id).delete();
    }
};
