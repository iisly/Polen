import { PROVINCES } from '@/lib/regions';
import { REGIONS } from '@/lib/constants';
import { Region } from '@/types/pollen';

/**
 * 위도/경도를 기반으로 가장 인접한 시·도를 반환합니다.
 * 단순 17개 시·도 중심 좌표가 아닌 200여 개 시·군·구 좌표(PROVINCES.districts)를
 * 전수 탐색하여 가장 가까운 시·군·구가 속한 광역 시·도를 찾으므로
 * 경북 북부, 경기 북부 등 시·도 경계 지역의 오차가 대폭 개선됩니다.
 */
export function findClosestRegion(lat: number, lng: number): Region {
  let minD = Infinity;
  let matchedProvinceCode = REGIONS[0].code;

  for (const province of PROVINCES) {
    for (const district of province.districts) {
      const d = Math.hypot(district.lat - lat, district.lng - lng);
      if (d < minD) {
        minD = d;
        matchedProvinceCode = province.code;
      }
    }
  }

  return REGIONS.find((r) => r.code === matchedProvinceCode) ?? REGIONS[0];
}
