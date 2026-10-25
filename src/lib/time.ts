/**
 * 한국 표준시(KST, UTC+9) 기준 날짜 계산 유틸리티.
 *
 * 모든 함수는 `now`를 인자로 받는 순수 함수로, 서버 런타임의 시간대 설정과
 * 무관하게 동일한 결과를 반환합니다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const RETRY_COOLDOWN_MS = 60 * 1000;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** KST 기준 달력 날짜 (시간 정보 없음). */
export interface KstDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

export interface KstDateTime extends KstDate {
  hour: number; // 0-23
}

/** 기상청 꽃가루 위험지수 발표 시각 (매일 06시, 18시). */
export interface Announcement {
  date: KstDate;
  hour: 6 | 18;
}

export function toKst(now: Date): KstDateTime {
  const shifted = new Date(now.getTime() + KST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
  };
}

export function addDays(date: KstDate, days: number): KstDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day) + days * DAY_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

/** `b - a`를 일 단위로 반환합니다. */
export function diffDays(a: KstDate, b: KstDate): number {
  const ta = Date.UTC(a.year, a.month - 1, a.day);
  const tb = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((tb - ta) / DAY_MS);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `YYYY-MM-DD` */
export function formatIsoDate(date: KstDate): string {
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`;
}

/** `10.7(수)` */
export function formatShortDate(date: KstDate): string {
  const weekday = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
  return `${date.month}.${date.day}(${WEEKDAYS[weekday]})`;
}

/** 기상청 API `time` 파라미터 형식 (`YYYYMMDDHH`). */
export function formatAnnouncementParam(a: Announcement): string {
  return `${a.date.year}${pad(a.date.month)}${pad(a.date.day)}${pad(a.hour)}`;
}

/** 화면 표시용 (`2026.10.06 18:00 발표`). */
export function formatAnnouncementLabel(a: Announcement): string {
  return `${a.date.year}.${pad(a.date.month)}.${pad(a.date.day)} ${pad(a.hour)}:00 발표`;
}

/** KST 시각 표시용 (`HH:mm` 또는 `HH:mm:ss`). */
export function formatKstTime(now: Date, includeSeconds = false): string {
  const shifted = new Date(now.getTime() + KST_OFFSET_MS);
  const hh = pad(shifted.getUTCHours());
  const mm = pad(shifted.getUTCMinutes());
  if (!includeSeconds) return `${hh}:${mm}`;
  const ss = pad(shifted.getUTCSeconds());
  return `${hh}:${mm}:${ss}`;
}

/** `now` 시점에 가장 최근 발표되었어야 하는 발표 시각. */
export function latestAnnouncement(now: Date): Announcement {
  const kst = toKst(now);
  const today: KstDate = { year: kst.year, month: kst.month, day: kst.day };
  if (kst.hour < 6) return { date: addDays(today, -1), hour: 18 };
  if (kst.hour < 18) return { date: today, hour: 6 };
  return { date: today, hour: 18 };
}

/** 주어진 발표의 직전 발표 시각. */
export function previousAnnouncement(a: Announcement): Announcement {
  if (a.hour === 18) return { date: a.date, hour: 6 };
  return { date: addDays(a.date, -1), hour: 18 };
}

/**
 * 다음 KST 기준 데이터 경계(00시 자정, 06시 발표, 18시 발표)까지 남은 초(second)를 반환합니다.
 */
export function secondsUntilNextBoundary(now: Date): number {
  const shifted = new Date(now.getTime() + KST_OFFSET_MS);
  const h = shifted.getUTCHours();
  const m = shifted.getUTCMinutes();
  const s = shifted.getUTCSeconds();
  const elapsedSeconds = h * 3600 + m * 60 + s;
  const nextBoundaryHour = h < 6 ? 6 : h < 18 ? 18 : 24;
  return Math.max(1, nextBoundaryHour * 3600 - elapsedSeconds);
}

/**
 * 스냅샷이 현재 시각(`now`) 기준으로 갱신이 필요한지 판정합니다.
 * - 자정(00:00 KST)이 지나 날짜(오늘/내일/모레 라벨)가 바뀐 경우 즉시 갱신
 * - 06시·18시 발표 경계를 새로 넘긴 경우 즉시 갱신
 * - 에러/부분 결측이거나 발표 직후 기상청 업로드 지연으로 이전 발표를 받은 경우 1분 쿨다운 후 재시도
 */
export function isSnapshotStale(
  snapshot: {
    status: string;
    generatedAt: string;
    announcement: { param: string } | null;
  },
  now: Date,
): boolean {
  const generatedDate = new Date(snapshot.generatedAt);
  if (Number.isNaN(generatedDate.getTime())) return true;

  // 1. 자정(00:00 KST)이 지나 날짜가 바뀐 경우
  if (formatIsoDate(toKst(generatedDate)) !== formatIsoDate(toKst(now))) return true;

  // 2. 스냅샷 생성 이후 새로운 발표 시각(06시·18시) 경계를 넘긴 경우
  const generatedExpectedParam = formatAnnouncementParam(latestAnnouncement(generatedDate));
  const nowExpectedParam = formatAnnouncementParam(latestAnnouncement(now));
  if (generatedExpectedParam !== nowExpectedParam) return true;

  const ageMs = now.getTime() - generatedDate.getTime();

  // 3. 불완전한 상태이거나 기상청 발표 지연으로 직전 발표 본을 들고 있는 경우 1분 쿨다운 후 재조회
  if (ageMs >= RETRY_COOLDOWN_MS) {
    if (snapshot.status === 'error' || snapshot.status === 'partial') return true;
    if (snapshot.status === 'ok' && snapshot.announcement && snapshot.announcement.param !== nowExpectedParam) {
      return true;
    }
  }

  return false;
}

/** 오늘 기준 상대 일자 라벨 (`오늘`, `내일`, `모레`, `글피`). */
export function relativeDayLabel(target: KstDate, today: KstDate): string {
  const diff = diffDays(today, target);
  switch (diff) {
    case 0:
      return '오늘';
    case 1:
      return '내일';
    case 2:
      return '모레';
    case 3:
      return '글피';
    default:
      return formatShortDate(target);
  }
}
