import type { RiskLevel, RiskValue } from '@/types/pollen';

/** 기상청 응답 1건의 일자별 필드 (발표일 기준 +0 ~ +3일). */
export const KMA_DAY_FIELDS = ['today', 'tomorrow', 'dayaftertomorrow', 'twodaysaftertomorrow'] as const;

export type DaySeries = [RiskValue, RiskValue, RiskValue, RiskValue];

/**
 * 기상청 원시 값을 위험 단계로 변환합니다.
 * 빈 값·숫자가 아닌 값·음수는 `null`(데이터 없음)로 처리하고, 절대 `0`으로 대체하지 않습니다.
 */
export function parseRiskValue(raw: unknown): RiskValue {
  if (raw === undefined || raw === null) return null;
  const text = String(raw).trim();
  if (text === '') return null;
  const num = Number.parseInt(text, 10);
  if (Number.isNaN(num) || num < 0) return null;
  if (num > 3) return 3;
  return num as RiskLevel;
}

/** 기상청 item 객체에서 발표일 기준 4일치 값을 추출합니다. */
export function parseKmaItem(item: Record<string, unknown>): DaySeries {
  return KMA_DAY_FIELDS.map((field) => parseRiskValue(item[field])) as DaySeries;
}

/**
 * 관할 지점 값들을 시·도 대표값으로 집계합니다.
 *
 * - 결측(`null`) 지점은 집계에서 제외합니다.
 * - 유효 지점이 전체의 `minCoverage` 미만이면 신뢰할 수 없으므로 `null`을 반환합니다.
 * - 대표값은 **상위 중앙값**입니다. 지점 수가 짝수일 때 가운데 두 값 중 높은 쪽을 택하므로
 *   건강 정보 특성상 보수적으로(위험을 낮춰 보이지 않게) 동작합니다.
 */
export function aggregateStations(values: RiskValue[], minCoverage = 0.5): RiskValue {
  if (values.length === 0) return null;
  const valid = values.filter((v): v is RiskLevel => v !== null);
  if (valid.length === 0) return null;
  if (valid.length < Math.ceil(values.length * minCoverage)) return null;
  const sorted = [...valid].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** 유효 값 중 최댓값. 모두 결측이면 `null`. */
export function maxRisk(values: RiskValue[]): RiskValue {
  let result: RiskValue = null;
  for (const v of values) {
    if (v !== null && (result === null || v > result)) result = v;
  }
  return result;
}

/**
 * 화면에 표시할 일자 오프셋(발표일 기준 0~3)을 고릅니다.
 *
 * - 이미 지난 날짜(`offset < minOffset`)는 제외합니다. 예: 자정 이후 전날 18시 발표를 쓰는 경우.
 * - 어느 지점에서도 값이 없는 날짜는 제외합니다. 예: 18시 발표는 `today` 필드가 비어 있음.
 */
export function selectDayOffsets(series: DaySeries[], minOffset: number): number[] {
  const offsets: number[] = [];
  for (let offset = Math.max(0, minOffset); offset < KMA_DAY_FIELDS.length; offset++) {
    if (series.some((s) => s[offset] !== null)) offsets.push(offset);
  }
  return offsets;
}

/** 동시 실행 수를 제한하면서 비동기 작업을 수행합니다. 결과 순서는 입력 순서를 따릅니다. */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
