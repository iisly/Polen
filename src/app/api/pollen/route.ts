import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getFreshPollenSnapshot, getPollenSnapshot } from '@/lib/pollen-data';
import { isSnapshotStale } from '@/lib/time';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

export async function GET(request: NextRequest) {
  try {
    const forceFresh = request.nextUrl.searchParams.get('fresh') === '1';
    const now = new Date();

    if (forceFresh) {
      revalidateTag('pollen-snapshot', { expire: 0 });
      revalidatePath('/');
      const freshSnapshot = await getFreshPollenSnapshot(now);
      return NextResponse.json(freshSnapshot, { headers: NO_STORE_HEADERS });
    }

    let snapshot = await getPollenSnapshot();
    if (isSnapshotStale(snapshot, now)) {
      revalidateTag('pollen-snapshot', { expire: 0 });
      revalidatePath('/');
      snapshot = await getFreshPollenSnapshot(now);
    }

    return NextResponse.json(snapshot, { headers: NO_STORE_HEADERS });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch pollen forecast', message },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}
