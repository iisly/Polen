import { cacheLife, cacheTag } from 'next/cache';
import { collectSnapshot, probeAnnouncementReady } from '@/lib/kma/collect';
import { formatAnnouncementParam, latestAnnouncement, secondsUntilNextBoundary } from '@/lib/time';
import type { PollenSnapshot } from '@/types/pollen';

/**
 * 캐시를 거치지 않고 기상청에서 즉시 최신 꽃가루 스냅샷을 수집합니다.
 */
export async function getFreshPollenSnapshot(now: Date = new Date()): Promise<PollenSnapshot> {
  return collectSnapshot(now, process.env.KMA_POLLEN_API_KEY ?? '');
}

/**
 * 최신 발표 시각(`latestAnnouncement(now)`)의 데이터가 기상청에 업로드되었는지 대표 지점 1곳만 빠르게(약 150ms) 확인합니다.
 */
export async function isLatestAnnouncementUploaded(now: Date = new Date()): Promise<boolean> {
  return probeAnnouncementReady(now, process.env.KMA_POLLEN_API_KEY ?? '', latestAnnouncement(now));
}

/**
 * 전국 꽃가루 스냅샷 (캐시됨).
 *
 * 기상청 데이터는 하루 2회(06시·18시) 발표되며 자정(00시)에 일자 라벨이 바뀌므로,
 * 다음 경계 시각(00·06·18시)을 넘겨 캐시되지 않도록 수명을 동적으로 제한합니다.
 * 또한 06·18시 직후 기상청 업로드 지연으로 직전 발표 본으로 대체된 경우에는
 * 1분 주기로 빠르게 재확인하여 최신 발표가 즉시 반영되도록 합니다.
 */
export async function getPollenSnapshot(): Promise<PollenSnapshot> {
  'use cache';
  cacheTag('pollen-snapshot');

  const now = new Date();
  const snapshot = await collectSnapshot(now, process.env.KMA_POLLEN_API_KEY ?? '');
  const expectedParam = formatAnnouncementParam(latestAnnouncement(now));
  const isFallbackAnnouncement =
    snapshot.status === 'ok' &&
    snapshot.announcement !== null &&
    snapshot.announcement.param !== expectedParam;

  if (snapshot.status === 'partial' || snapshot.status === 'error' || isFallbackAnnouncement) {
    // 불완전한 결과이거나 새 발표 시각 직후 기상청 업로드 지연으로 직전 발표를 받은 경우 짧게만 캐시합니다.
    cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  } else {
    const ttl = secondsUntilNextBoundary(now);
    const revalidate = Math.min(900, Math.max(60, ttl));
    const expire = Math.max(300, revalidate + 60, ttl);
    cacheLife({ stale: 60, revalidate, expire });
  }

  return snapshot;
}
