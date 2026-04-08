import { NextResponse } from 'next/server';
import { postToAPI } from '@/utils/api';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Submit to Strapi
    const response = await postToAPI('accommodations', {
      data: formData
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error in accommodation submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit accommodation request' },
      { status: 500 }
    );
  }
}