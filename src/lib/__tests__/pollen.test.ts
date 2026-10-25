import { describe, it, expect } from 'vitest';
import { parseRiskValue, aggregateStations, maxRisk } from '@/lib/kma/aggregate';
import {
  toKst,
  latestAnnouncement,
  previousAnnouncement,
  formatAnnouncementParam,
  secondsUntilNextBoundary,
  isSnapshotStale,
} from '@/lib/time';
import { findClosestRegion } from '@/lib/geo';
import { getActivePollenTypes } from '@/lib/constants';

describe('Pollen Pure Utilities', () => {
  describe('kma/aggregate', () => {
    it('parseRiskValue converts numbers correctly and preserves null on invalid/empty values', () => {
      expect(parseRiskValue('0')).toBe(0);
      expect(parseRiskValue('1')).toBe(1);
      expect(parseRiskValue('2')).toBe(2);
      expect(parseRiskValue('3')).toBe(3);
      expect(parseRiskValue('4')).toBe(3); // Cap at 3
      expect(parseRiskValue('')).toBeNull();
      expect(parseRiskValue(null)).toBeNull();
      expect(parseRiskValue(undefined)).toBeNull();
      expect(parseRiskValue('invalid')).toBeNull();
    });

    it('aggregateStations ignores null and returns upper-median if coverage is sufficient', () => {
      expect(aggregateStations([0, 1, 2])).toBe(1);
      expect(aggregateStations([0, null, 2])).toBe(2); // Valid is [0, 2], upper median is 2
      expect(aggregateStations([null, null, 2])).toBeNull(); // 1 out of 3 is 33% (< 50%)
      expect(aggregateStations([1, 2])).toBe(2); // Upper median
    });

    it('maxRisk calculates maximum valid level or returns null if all null', () => {
      expect(maxRisk([0, 1, 2])).toBe(2);
      expect(maxRisk([null, 1, null])).toBe(1);
      expect(maxRisk([null, null])).toBeNull();
    });
  });

  describe('time utils', () => {
    it('toKst calculates correct KST time irrespective of runtime timezone', () => {
      const utcDate = new Date('2026-10-06T00:00:00Z'); // 09:00 KST
      const kst = toKst(utcDate);
      expect(kst.year).toBe(2026);
      expect(kst.month).toBe(10);
      expect(kst.day).toBe(6);
      expect(kst.hour).toBe(9);
    });

    it('latestAnnouncement returns correct KMA base hours (06 or 18)', () => {
      // 03:00 KST -> Previous day 18:00
      const earlyMorning = new Date('2026-10-06T18:00:00Z'); // 03:00 KST on Oct 7
      const a1 = latestAnnouncement(earlyMorning);
      expect(a1.hour).toBe(18);
      expect(formatAnnouncementParam(a1)).toBe('2026100618');

      // 10:00 KST -> Today 06:00
      const morning = new Date('2026-10-06T01:00:00Z'); // 10:00 KST on Oct 6
      const a2 = latestAnnouncement(morning);
      expect(a2.hour).toBe(6);
      expect(formatAnnouncementParam(a2)).toBe('2026100606');
    });

    it('previousAnnouncement steps backward correctly', () => {
      const a18 = { date: { year: 2026, month: 10, day: 6 }, hour: 18 as const };
      expect(previousAnnouncement(a18).hour).toBe(6);

      const a6 = { date: { year: 2026, month: 10, day: 6 }, hour: 6 as const };
      const prev = previousAnnouncement(a6);
      expect(prev.hour).toBe(18);
      expect(prev.date.day).toBe(5);
    });

    it('secondsUntilNextBoundary calculates remaining seconds to 00/06/18 KST', () => {
      // 05:55:00 KST -> 300s until 06:00 KST
      expect(secondsUntilNextBoundary(new Date('2026-10-25T20:55:00Z'))).toBe(300);
      // 17:50:00 KST -> 600s until 18:00 KST
      expect(secondsUntilNextBoundary(new Date('2026-10-25T08:50:00Z'))).toBe(600);
      // 23:59:00 KST -> 60s until 24:00 (00:00) KST
      expect(secondsUntilNextBoundary(new Date('2026-10-25T14:59:00Z'))).toBe(60);
    });

    it('isSnapshotStale detects midnight, 06/18 announcement transitions, and fallback retries', () => {
      // 1. Fresh snapshot within same slot
      const snap1 = {
        status: 'ok',
        generatedAt: '2026-10-25T15:40:00Z', // 2026-10-26 00:40 KST
        announcement: { param: '2026102518' },
      };
      expect(isSnapshotStale(snap1, new Date('2026-10-25T15:42:00Z'))).toBe(false);

      // 2. Crossed midnight (23:58 KST -> 00:01 KST)
      const beforeMidnight = {
        status: 'ok',
        generatedAt: '2026-10-25T14:58:00Z', // 2026-10-25 23:58 KST
        announcement: { param: '2026102518' },
      };
      expect(isSnapshotStale(beforeMidnight, new Date('2026-10-25T15:01:00Z'))).toBe(true);

      // 3. Crossed 18:00 announcement boundary (17:59 KST -> 18:00:10 KST)
      const before18 = {
        status: 'ok',
        generatedAt: '2026-10-25T08:59:00Z', // 2026-10-25 17:59 KST
        announcement: { param: '2026102506' },
      };
      expect(isSnapshotStale(before18, new Date('2026-10-25T09:00:10Z'))).toBe(true);

      // 4. Fallback announcement right after 18:00 waits 60s cooldown before retry
      const fallbackAt1801 = {
        status: 'ok',
        generatedAt: '2026-10-25T09:01:00Z', // 2026-10-25 18:01:00 KST
        announcement: { param: '2026102506' },
      };
      expect(isSnapshotStale(fallbackAt1801, new Date('2026-10-25T09:01:20Z'))).toBe(false);
      expect(isSnapshotStale(fallbackAt1801, new Date('2026-10-25T09:02:05Z'))).toBe(true);
    });
  });

  describe('constants & season logic', () => {
    it('active pollen types for oak and pine must be 3..6', () => {
      expect(getActivePollenTypes(3)).toEqual(['oak', 'pine']);
      expect(getActivePollenTypes(4)).toEqual(['oak', 'pine']);
      expect(getActivePollenTypes(5)).toEqual(['oak', 'pine']);
      expect(getActivePollenTypes(6)).toEqual(['oak', 'pine']);
      expect(getActivePollenTypes(7)).toEqual([]);
      expect(getActivePollenTypes(8)).toEqual(['weeds']);
      expect(getActivePollenTypes(10)).toEqual(['weeds']);
    });
  });

  describe('geo lookup', () => {
    it('findClosestRegion returns correct province', () => {
      // Near Gangnam Station (Seoul)
      const r1 = findClosestRegion(37.4979, 127.0276);
      expect(r1.shortName).toBe('서울');

      // Near Suwon City Hall (Gyeonggi)
      const r2 = findClosestRegion(37.2636, 127.0286);
      expect(r2.shortName).toBe('경기');

      // Near Haeundae (Busan)
      const r3 = findClosestRegion(35.1587, 129.1604);
      expect(r3.shortName).toBe('부산');
    });
  });
});
