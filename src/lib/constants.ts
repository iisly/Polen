import { PollenType, RiskLevel, RiskLevelInfo, Region } from '@/types/pollen';

export const REGIONS: Region[] = [
  { code: '1100000000', name: '서울특별시', shortName: '서울', lat: 37.5665, lng: 126.9780 },
  { code: '4100000000', name: '경기도', shortName: '경기', lat: 37.2636, lng: 127.0286 },
  { code: '2800000000', name: '인천광역시', shortName: '인천', lat: 37.4563, lng: 126.7052 },
  { code: '4200000000', name: '강원특별자치도', shortName: '강원', lat: 37.8854, lng: 127.7298 },
  { code: '3000000000', name: '대전광역시', shortName: '대전', lat: 36.3504, lng: 127.3845 },
  { code: '3611000000', name: '세종특별자치시', shortName: '세종', lat: 36.4800, lng: 127.2890 },
  { code: '4300000000', name: '충청북도', shortName: '충북', lat: 36.6424, lng: 127.4890 },
  { code: '4400000000', name: '충청남도', shortName: '충남', lat: 36.8151, lng: 127.1139 },
  { code: '2600000000', name: '부산광역시', shortName: '부산', lat: 35.1796, lng: 129.0756 },
  { code: '2700000000', name: '대구광역시', shortName: '대구', lat: 35.8714, lng: 128.6014 },
  { code: '3100000000', name: '울산광역시', shortName: '울산', lat: 35.5384, lng: 129.3114 },
  { code: '4700000000', name: '경상북도', shortName: '경북', lat: 36.0190, lng: 129.3435 },
  { code: '4800000000', name: '경상남도', shortName: '경남', lat: 35.2280, lng: 128.6811 },
  { code: '2900000000', name: '광주광역시', shortName: '광주', lat: 35.1595, lng: 126.8526 },
  { code: '4500000000', name: '전북특별자치도', shortName: '전북', lat: 35.8242, lng: 127.1480 },
  { code: '4600000000', name: '전라남도', shortName: '전남', lat: 34.8118, lng: 126.3922 },
  { code: '5000000000', name: '제주특별자치도', shortName: '제주', lat: 33.4996, lng: 126.5312 },
];

export const POLLEN_SPECIES_INFO: Record<PollenType, {
  name: string;
  seasonText: string;
  seasonMonths: number[];
  endpoint: string;
}> = {
  oak: {
    name: '참나무',
    seasonText: '4월 ~ 6월 (봄철 수목류)',
    seasonMonths: [4, 5, 6],
    endpoint: 'getOakPollenRiskIdx',
  },
  pine: {
    name: '소나무 (송홧가루)',
    seasonText: '4월 ~ 6월 (봄철 송홧가루)',
    seasonMonths: [4, 5, 6],
    endpoint: 'getPinePollenRiskIdx',
  },
  weeds: {
    name: '잡초류 (돼지풀·환삼덩굴·쑥)',
    seasonText: '8월 ~ 10월 (가을철 초본류)',
    seasonMonths: [8, 9, 10],
    endpoint: 'getWeedsPollenRiskndx',
  },
};

export interface MonthPollenInfo {
  month: number;
  seasonName: string;
  statusText: string;
  mainCause: string;
  dangerLevel: 0 | 1 | 2 | 3;
}

export const ANNUAL_POLLEN_CALENDAR: MonthPollenInfo[] = [
  { month: 1, seasonName: '겨울 안전기', statusText: '안전', mainCause: '꽃가루 없음 (실내 집먼지진드기 주의)', dangerLevel: 0 },
  { month: 2, seasonName: '겨울 안전기', statusText: '안전', mainCause: '꽃가루 없음 (남부 일부 오리나무 개화)', dangerLevel: 0 },
  { month: 3, seasonName: '봄 태동기', statusText: '주의', mainCause: '오리나무, 자작나무 비산 시작', dangerLevel: 1 },
  { month: 4, seasonName: '봄 수목류 피크', statusText: '피크', mainCause: '참나무, 소나무(송홧가루), 자작나무 대량 비산', dangerLevel: 3 },
  { month: 5, seasonName: '봄 수목류 피크', statusText: '피크', mainCause: '참나무 및 소나무 비산 절정기', dangerLevel: 3 },
  { month: 6, seasonName: '초여름 잔여', statusText: '주의', mainCause: '잔여 소나무 및 목초류(잔디)', dangerLevel: 1 },
  { month: 7, seasonName: '여름 휴지기', statusText: '안전', mainCause: '장마 및 강우로 꽃가루 비산 거의 없음', dangerLevel: 0 },
  { month: 8, seasonName: '가을 초본류 시작', statusText: '경계', mainCause: '돼지풀, 환삼덩굴, 쑥 비산 시작', dangerLevel: 2 },
  { month: 9, seasonName: '가을 초본류 피크', statusText: '피크', mainCause: '환삼덩굴, 쑥, 돼지풀 대량 발생 (비염 주원인)', dangerLevel: 3 },
  { month: 10, seasonName: '가을 말기', statusText: '경계', mainCause: '잡초류 잔여 비산 (중순 이후 점차 감소)', dangerLevel: 2 },
  { month: 11, seasonName: '겨울 안전기', statusText: '안전', mainCause: '꽃가루 시즌 종료 (건조한 실내 환경 관리)', dangerLevel: 0 },
  { month: 12, seasonName: '겨울 안전기', statusText: '안전', mainCause: '꽃가루 없음 (한파 및 찬 공기 호흡기 보호)', dangerLevel: 0 },
];
