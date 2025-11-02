import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const id = params?.id ?? null;
    return NextResponse.json(
        { message: "Not implemented yet", id },
        { status: 501 }
    );
}