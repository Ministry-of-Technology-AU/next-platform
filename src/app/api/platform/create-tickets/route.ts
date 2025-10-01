import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Console log the form data for now
    console.log('Create Ticket Form Data:', formData);
    
    // Return success response
    return NextResponse.json(
      { message: 'Ticket created successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}