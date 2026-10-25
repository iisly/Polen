import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  getFreshPollenSnapshot,
  getPollenSnapshot,
  isLatestAnnouncementUploaded,
} from '@/lib/pollen-data';
import {
  formatAnnouncementParam,
  formatIsoDate,
  isSnapshotStale,
  latestAnnouncement,
  toKst,
} from '@/lib/time';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

export async function GET(request: NextRequest) {
  try {
    const forceFresh = request.nextUrl.searchParams.get('fresh') === '1';
    const now = new Date();
    const cached = await getPollenSnapshot();

    const sameKstDay =
      formatIsoDate(toKst(new Date(cached.generatedAt))) === formatIsoDate(toKst(now));
    const expectedParam = formatAnnouncementParam(latestAnnouncement(now));
    const hasLatestAnnouncement = cached.announcement?.param === expectedParam;

    // 1. 이미 오늘 날짜 + 최신 발표(06·18시)가 정상('ok') 수집되어 있다면
    // 기상청 161개 지점을 다시 호출할 필요가 없으므로 즉시(~20ms) 반환합니다.
    if (cached.status === 'ok' && sameKstDay && hasLatestAnnouncement) {
      return NextResponse.json(
        forceFresh ? { ...cached, generatedAt: now.toISOString() } : cached,
        { headers: NO_STORE_HEADERS },
      );
    }

    // 2. 06·18시 직후 기상청 업로드 지연으로 직전 발표를 들고 있는 경우:
    // 대표 지점 1곳만 빠르게(~150ms) 찔러보고, 아직 안 올라왔으면 161개 지점 재호출 없이 즉시 반환합니다.
    if (
      cached.status === 'ok' &&
      sameKstDay &&
      !hasLatestAnnouncement &&
      (forceFresh || isSnapshotStale(cached, now))
    ) {
      const uploaded = await isLatestAnnouncementUploaded(now);
      if (!uploaded) {
        return NextResponse.json(
          { ...cached, generatedAt: now.toISOString() },
          { headers: NO_STORE_HEADERS },
        );
      }
    }

    // 3. 실제로 자정/발표시각이 바뀌어 새 발표가 올라왔거나, 이전 수집이 실패/부분결측인 경우에만 전체 수집을 수행합니다.
    if (forceFresh || isSnapshotStale(cached, now)) {
      revalidateTag('pollen-snapshot', { expire: 0 });
      revalidatePath('/');
      const freshSnapshot = await getFreshPollenSnapshot(now);
      return NextResponse.json(freshSnapshot, { headers: NO_STORE_HEADERS });
    }

    return NextResponse.json(cached, { headers: NO_STORE_HEADERS });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch pollen forecast', message },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}
