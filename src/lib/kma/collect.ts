import { REGIONS, POLLEN_SPECIES_INFO, getActivePollenTypes } from '@/lib/constants';
import { getRegionStations, type StationPoint } from '@/lib/kmaStationPoints';
import {
  addDays,
  diffDays,
  formatAnnouncementLabel,
  formatAnnouncementParam,
  formatIsoDate,
  formatShortDate,
  latestAnnouncement,
  previousAnnouncement,
  relativeDayLabel,
  toKst,
  type Announcement,
  type KstDate,
} from '@/lib/time';
import {
  aggregateStations,
  mapWithConcurrency,
  maxRisk,
  parseKmaItem,
  selectDayOffsets,
  type DaySeries,
} from '@/lib/kma/aggregate';
import type {
  PollenSnapshot,
  PollenType,
  RegionForecast,
  RiskValue,
  SnapshotStatus,
} from '@/types/pollen';

const KMA_BASE_URL = 'https://apis.data.go.kr/1360000/HealthWthrIdxServiceV3';
const REQUEST_TIMEOUT_MS = 8000;
const CONCURRENCY = 12;
/** 이 비율 이상 수신되면 `ok`, 그 미만이면 `partial`. */
const OK_COVERAGE = 0.95;
/** 이 비율 미만이면 `error`. */
const MIN_COVERAGE = 0.5;

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

type StationResult = { ok: true; series: DaySeries } | { ok: false; reason: string };

/**
 * 공공데이터포털 인증키는 Encoding/Decoding 두 형태가 있습니다.
 * 이미 퍼센트 인코딩된 키(Encoding 키)를 다시 인코딩하면 인증에 실패하므로 구분해서 처리합니다.
 */
function encodeServiceKey(key: string): string {
  return /%[0-9A-Fa-f]{2}/.test(key) ? key : encodeURIComponent(key);
}

function buildUrl(apiKey: string, type: PollenType, areaNo: string, time: string): string {
  const query = new URLSearchParams({
    pageNo: '1',
    numOfRows: '1',
    dataType: 'JSON',
    areaNo,
    time,
  });
  return `${KMA_BASE_URL}/${POLLEN_SPECIES_INFO[type].endpoint}?serviceKey=${encodeServiceKey(apiKey)}&${query}`;
}

async function fetchStationOnce(fetcher: Fetcher, url: string): Promise<StationResult> {
  const res = await fetcher(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!res.ok) return { ok: false, reason: `http_${res.status}` };

  // 인증 오류 등은 dataType=JSON이어도 XML로 응답하는 경우가 있어 text로 먼저 받습니다.
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    const code = /<returnReasonCode>(\d+)<\/returnReasonCode>/.exec(text)?.[1];
    return { ok: false, reason: code ? `kma_auth_${code}` : 'invalid_response' };
  }

  const response = (data as { response?: { header?: { resultCode?: string }; body?: { items?: { item?: unknown[] } } } })
    .response;
  const resultCode = response?.header?.resultCode;
  if (resultCode !== '00') return { ok: false, reason: `kma_${resultCode ?? 'unknown'}` };

  const item = response?.body?.items?.item?.[0];
  if (!item || typeof item !== 'object') return { ok: false, reason: 'empty_item' };
  return { ok: true, series: parseKmaItem(item as Record<string, unknown>) };
}

/** 지점 1곳 조회. 네트워크·HTTP 오류는 1회 재시도합니다. */
async function fetchStation(
  fetcher: Fetcher,
  apiKey: string,
  type: PollenType,
  areaNo: string,
  time: string,
): Promise<StationResult> {
  const url = buildUrl(apiKey, type, areaNo, time);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await fetchStationOnce(fetcher, url);
      // 기상청이 명시적으로 응답한 오류(kma_*)는 재시도해도 같으므로 바로 반환합니다.
      if (result.ok || result.reason.startsWith('kma')) return result;
      if (attempt === 1) return result;
    } catch (err) {
      if (attempt === 1) {
        return { ok: false, reason: err instanceof Error && err.name === 'TimeoutError' ? 'timeout' : 'network' };
      }
    }
  }
  return { ok: false, reason: 'unreachable' };
}

function emptySnapshot(
  now: Date,
  status: SnapshotStatus,
  message: string,
  announcement: Announcement | null = null,
): PollenSnapshot {
  const kst = toKst(now);
  return {
    status,
    generatedAt: now.toISOString(),
    announcement: announcement
      ? { param: formatAnnouncementParam(announcement), label: formatAnnouncementLabel(announcement) }
      : null,
    month: kst.month,
    activeTypes: getActivePollenTypes(kst.month),
    days: [],
    regions: {},
    coverage: { ok: 0, total: 0 },
    message,
  };
}

/**
 * 전국 17개 시·도의 꽃가루 위험지수 스냅샷을 수집합니다.
 *
 * 순수하게 입력(`now`, `apiKey`, `fetcher`)에만 의존하므로 테스트에서 가짜 fetcher를 주입할 수 있습니다.
 * 캐싱은 호출하는 쪽(`getPollenSnapshot`)에서 담당합니다.
 */
export async function collectSnapshot(
  now: Date,
  apiKey: string,
  fetcher: Fetcher = fetch,
): Promise<PollenSnapshot> {
  const startedAt = performance.now();
  const kst = toKst(now);
  const today: KstDate = { year: kst.year, month: kst.month, day: kst.day };
  const activeTypes = getActivePollenTypes(kst.month);

  if (activeTypes.length === 0) {
    return emptySnapshot(now, 'off-season', '지금은 꽃가루 비산 휴지기라 기상청이 위험지수를 제공하지 않는 기간입니다.');
  }
  if (!apiKey) {
    return emptySnapshot(now, 'no-key', '서버에 기상청 API 키(KMA_POLLEN_API_KEY)가 설정되지 않았습니다.');
  }

  // 1. 발표 시각 결정: 최신 발표가 아직 올라오지 않았으면(예: 06:05) 직전 발표로 대체합니다.
  const latest = latestAnnouncement(now);
  const probeRegion = REGIONS[0];
  let announcement: Announcement | null = null;
  let probeReason = '';
  for (const candidate of [latest, previousAnnouncement(latest)]) {
    const probe = await fetchStation(fetcher, apiKey, activeTypes[0], probeRegion.code, formatAnnouncementParam(candidate));
    if (probe.ok && probe.series.some((v) => v !== null)) {
      announcement = candidate;
      break;
    }
    probeReason = probe.ok ? 'empty_series' : probe.reason;
  }
  if (!announcement) {
    console.error(JSON.stringify({ event: 'pollen_collect_failed', stage: 'probe', reason: probeReason }));
    const message = probeReason.startsWith('kma_auth')
      ? '기상청 API 인증에 실패했습니다. 서버 API 키를 확인해 주세요.'
      : '기상청 데이터를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.';
    return emptySnapshot(now, 'error', message);
  }
  const time = formatAnnouncementParam(announcement);

  // 2. 전체 지점 × 활성 수종 조회 (동시 실행 수 제한)
  const regionStations = REGIONS.map((region) => ({
    region,
    stations: getRegionStations(region.code, region.name),
  }));
  const uniqueStations = new Map<string, StationPoint>();
  for (const { stations } of regionStations) {
    for (const st of stations) uniqueStations.set(st.code, st);
  }
  const tasks = activeTypes.flatMap((type) => [...uniqueStations.keys()].map((code) => ({ type, code })));
  const results = await mapWithConcurrency(tasks, CONCURRENCY, ({ type, code }) =>
    fetchStation(fetcher, apiKey, type, code, time),
  );

  const seriesByKey = new Map<string, DaySeries>();
  const failureReasons: Record<string, number> = {};
  results.forEach((result, i) => {
    const key = `${tasks[i].type}:${tasks[i].code}`;
    if (result.ok) seriesByKey.set(key, result.series);
    else failureReasons[result.reason] = (failureReasons[result.reason] ?? 0) + 1;
  });
  const okCount = seriesByKey.size;
  const ratio = tasks.length > 0 ? okCount / tasks.length : 0;

  // 3. 표시할 날짜 결정 (지난 날짜·전 지점 공란 날짜 제외)
  const minOffset = diffDays(announcement.date, today);
  const offsets = selectDayOffsets([...seriesByKey.values()], minOffset);
  const days = offsets.map((offset) => {
    const date = addDays(announcement.date, offset);
    return { date: formatIsoDate(date), label: relativeDayLabel(date, today), shortDate: formatShortDate(date) };
  });

  const seriesAt = (type: PollenType, code: string, offset: number): RiskValue =>
    seriesByKey.get(`${type}:${code}`)?.[offset] ?? null;

  // 4. 시·도별 집계
  const regions: Record<string, RegionForecast> = {};
  for (const { region, stations } of regionStations) {
    const byType: RegionForecast['byType'] = {};
    for (const type of activeTypes) {
      byType[type] = offsets.map((offset) => aggregateStations(stations.map((st) => seriesAt(type, st.code, offset))));
    }
    regions[region.code] = {
      code: region.code,
      overall: offsets.map((_, i) => maxRisk(activeTypes.map((type) => byType[type]![i]))),
      byType,
      stations:
        stations.length > 1
          ? stations.map((st) => ({
              code: st.code,
              name: st.name,
              overall: offsets.map((offset) => maxRisk(activeTypes.map((type) => seriesAt(type, st.code, offset)))),
            }))
          : [],
    };
  }

  const status: SnapshotStatus =
    ratio >= OK_COVERAGE ? 'ok' : ratio >= MIN_COVERAGE ? 'partial' : 'error';
  const message =
    status === 'ok'
      ? '기상청 꽃가루농도위험지수를 정상적으로 수신했습니다.'
      : status === 'partial'
        ? `일부 지점(${tasks.length - okCount}/${tasks.length})의 데이터를 받지 못했습니다. 회색 지역은 데이터가 없는 곳입니다.`
        : '기상청 데이터를 대부분 받지 못했습니다. 잠시 후 다시 확인해 주세요.';

  console.info(
    JSON.stringify({
      event: 'pollen_collect',
      status,
      announcement: time,
      ok: okCount,
      total: tasks.length,
      failures: failureReasons,
      durationMs: Math.round(performance.now() - startedAt),
    }),
  );

  return {
    status,
    generatedAt: now.toISOString(),
    announcement: { param: time, label: formatAnnouncementLabel(announcement) },
    month: kst.month,
    activeTypes,
    days,
    regions,
    coverage: { ok: okCount, total: tasks.length },
    message,
  };
}
