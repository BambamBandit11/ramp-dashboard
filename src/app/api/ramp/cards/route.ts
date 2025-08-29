import { NextResponse } from 'next/server';
import { rampServerClient } from '@/lib/ramp-server';

export async function GET() {
  try {
    const result = await rampServerClient.getCards();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}