export type PollenType = 'oak' | 'pine' | 'weeds';

export type RiskLevel = 0 | 1 | 2 | 3;

/** `null`은 "데이터 없음"(결측·장애·미발표)을 의미하며, 절대 `0`(낮음)으로 대체하지 않습니다. */
export type RiskValue = RiskLevel | null;

export interface Region {
  code: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
}

/**
 * 스냅샷 상태.
 * - `ok`: 정상 수신
 * - `partial`: 일부 지점 결측 (표시는 하되 안내)
 * - `off-season`: 기상청 비제공 기간
 * - `no-key`: 서버 API 키 미설정
 * - `error`: 수신 실패 (대부분 결측)
 */
export type SnapshotStatus = 'ok' | 'partial' | 'off-season' | 'no-key' | 'error';

export interface ForecastDayInfo {
  /** `YYYY-MM-DD` (KST) */
  date: string;
  /** `오늘`, `내일`, `모레`, `글피` */
  label: string;
  /** `10.7(수)` */
  shortDate: string;
}

export interface StationForecast {
  code: string;
  name: string;
  /** `days`와 같은 인덱스. 활성 수종 중 최댓값. */
  overall: RiskValue[];
}

export interface RegionForecast {
  code: string;
  /** `days`와 같은 인덱스. 활성 수종 중 최댓값. */
  overall: RiskValue[];
  byType: Partial<Record<PollenType, RiskValue[]>>;
  /** 관할 지점이 2곳 이상인 시·도에서만 채워집니다. */
  stations: StationForecast[];
}

export interface PollenSnapshot {
  status: SnapshotStatus;
  /** 스냅샷 생성 시각 (ISO 8601) */
  generatedAt: string;
  announcement: { param: string; label: string } | null;
  /** 스냅샷 생성 시점의 KST 월 (1-12) */
  month: number;
  activeTypes: PollenType[];
  days: ForecastDayInfo[];
  regions: Record<string, RegionForecast>;
  coverage: { ok: number; total: number };
  message: string;
}
