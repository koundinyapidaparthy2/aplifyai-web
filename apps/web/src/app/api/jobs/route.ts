import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { applications } from "@/lib/applications";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
        }

        await applications.updateStatus(id, status);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating job status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
