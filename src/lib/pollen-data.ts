import { cacheLife, cacheTag } from 'next/cache';
import { collectSnapshot } from '@/lib/kma/collect';
import type { PollenSnapshot } from '@/types/pollen';

/**
 * 전국 꽃가루 스냅샷 (캐시됨).
 *
 * 기상청 데이터는 하루 2회(06시·18시)만 바뀌므로, 요청마다 기상청을 호출하지 않고
 * 이 함수의 결과를 모든 사용자가 공유합니다. 페이지와 `/api/pollen`이 모두 이 함수를 사용하며,
 * 결과는 프리렌더된 정적 응답에 포함되어 `revalidate` 주기마다 백그라운드에서 갱신됩니다.
 */
export async function getPollenSnapshot(): Promise<PollenSnapshot> {
  'use cache';
  cacheTag('pollen-snapshot');

  const snapshot = await collectSnapshot(new Date(), process.env.KMA_POLLEN_API_KEY ?? '');

  if (snapshot.status === 'partial' || snapshot.status === 'error') {
    // 불완전한 결과는 짧게만 캐시해서 빠르게 복구되도록 합니다.
    cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  } else {
    cacheLife({ stale: 300, revalidate: 1800, expire: 86400 });
  }

  return snapshot;
}
