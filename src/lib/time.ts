/**
 * 한국 표준시(KST, UTC+9) 기준 날짜 계산 유틸리티.
 *
 * 모든 함수는 `now`를 인자로 받는 순수 함수로, 서버 런타임의 시간대 설정과
 * 무관하게 동일한 결과를 반환합니다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
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
