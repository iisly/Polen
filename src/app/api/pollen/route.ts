import { NextResponse } from 'next/server';
import { getPollenSnapshot } from '@/lib/pollen-data';

export async function GET() {
  try {
    const snapshot = await getPollenSnapshot();
    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch pollen forecast', message },
      { status: 502 },
    );
  }
}
