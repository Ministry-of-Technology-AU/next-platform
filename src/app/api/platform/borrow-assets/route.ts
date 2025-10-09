import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
}