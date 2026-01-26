import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (optional but recommended)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Trigger a revalidation of the dashboard data by calling the transactions API
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/ramp/transactions`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh: ${response.status}`);
    }

    console.log(`[Cron] Daily refresh completed at ${new Date().toISOString()}`);
    
    return NextResponse.json({ 
      success: true, 
      refreshedAt: new Date().toISOString(),
      message: 'Daily data refresh completed'
    });
  } catch (error) {
    console.error('[Cron] Refresh failed:', error);
    return NextResponse.json({ 
      error: 'Refresh failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
