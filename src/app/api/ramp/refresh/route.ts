import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Endpoints to refresh - all mapping/lookup data
const REFRESH_ENDPOINTS = [
  '/api/ramp/transactions',
  '/api/ramp/users',
  '/api/ramp/cards',
];

/**
 * Manual refresh endpoint for Accounting to trigger cache updates
 * POST /api/ramp/refresh
 */
export async function POST(request: Request) {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const results: Record<string, { success: boolean; error?: string }> = {};

  try {
    // Refresh all endpoints in parallel
    const refreshPromises = REFRESH_ENDPOINTS.map(async (endpoint) => {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        results[endpoint] = { success: true };
      } catch (error) {
        results[endpoint] = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    await Promise.all(refreshPromises);

    const allSuccessful = Object.values(results).every(r => r.success);
    const failedCount = Object.values(results).filter(r => !r.success).length;

    console.log(`[Manual Refresh] Completed at ${new Date().toISOString()}`, results);
    
    return NextResponse.json({ 
      success: allSuccessful, 
      refreshedAt: new Date().toISOString(),
      message: allSuccessful 
        ? 'All data refreshed successfully' 
        : `Refresh completed with ${failedCount} failures`,
      results
    }, { status: allSuccessful ? 200 : 207 });
  } catch (error) {
    console.error('[Manual Refresh] Failed:', error);
    return NextResponse.json({ 
      error: 'Refresh failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
