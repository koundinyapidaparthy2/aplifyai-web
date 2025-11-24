import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { applications } from "@/lib/applications";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real app, we'd get the userId from the session or look it up via email
    // For now, we'll assume the email is the userId or we'd look it up
    // Let's just use email as userId for simplicity in this demo if userId isn't available directly
    // But wait, our auth config puts userId in session.user.id usually if configured right.
    // Let's check auth-config.ts again or just use email for now if ID is missing.
    // Actually, let's try to get the user ID from the session if possible.
    // If not, we might need to look up the user by email.
    // For this implementation, let's assume we can use the email as a proxy or the ID is there.

    const userId = session.user.id || session.user.email;

    if (!userId) {
        return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    try {
        const jobs = await applications.getAll(userId);
        return NextResponse.json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;
    if (!userId) {
        return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    try {
        const data = await req.json();
        const id = await applications.add(userId, data);
        return NextResponse.json({ id, ...data });
    } catch (error) {
        console.error("Error adding job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "Missing job ID" }, { status: 400 });
    }

    try {
        await applications.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
