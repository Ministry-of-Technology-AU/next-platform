"use server";
import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/apis/calendar';

export async function GET(request: NextRequest) {
    const now = new Date();
    const then = new Date();
    then.setMonth(then.getMonth() + 1);
    console.log(now, ", ", then);
    const response = getEvents(
      now.toISOString(),
      then.toISOString()
    );
    return NextResponse.json(await response);
}

export async function POST(request: NextRequest) {
    return NextResponse.json({ message: "POST method not implemented" });
}

export async function PUT(request: NextRequest) {
    return NextResponse.json({ message: "PUT method not implemented" });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ message: "method not implemented" });
}
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ message: "method not implemented" });
}