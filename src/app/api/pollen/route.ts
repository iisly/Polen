import { NextRequest, NextResponse } from 'next/server';
import { REGIONS, POLLEN_SPECIES_INFO } from '@/lib/constants';
import { PollenApiResponse, PollenForecastItem, PollenType, RegionalDailyRisks, RiskLevel } from '@/types/pollen';
import { KMA_REGION_STATIONS, calculateMajorityRisk } from '@/lib/kmaStationPoints';

function getKstDateTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (9 * 3600000));
  
  const currentMonthNum = kst.getMonth() + 1;
  const hour = kst.getHours();

  let targetDate = kst;
  let baseHour = '06';

  // 기상청 꽃가루 위험지수는 매일 06:00, 18:00 하루 2회 발표됩니다.
  if (hour < 6) {
    targetDate = new Date(kst.getTime() - 24 * 3600000);
    baseHour = '18';
  } else if (hour >= 18) {
    targetDate = kst;
    baseHour = '18';
  } else {
    targetDate = kst;
    baseHour = '06';
  }

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  const baseDate = `${y}${m}${d}`;

  return {
    timeStr: `${baseDate}${baseHour}`,
    currentMonthNum,
    displayDate: `${y}.${m}.${d} ${baseHour}:00 발표 기준`,
  };
}

// 🌸 스마트 계절 판정: 불필요한 호출을 원천 차단
// 3~6월: 참나무, 소나무만 제공
// 8~10월: 잡초류만 제공
// 1, 2, 7, 11, 12월: 미제공 (API 호출 생략)
function getActivePollenTypes(month: number): PollenType[] {
  if (month >= 3 && month <= 6) {
    return ['oak', 'pine'];
  }
  if (month >= 8 && month <= 10) {
    return ['weeds'];
  }
  return [];
}

// 지점 단일 API 호출 헬퍼
async function fetchStationItem(apiKey: string, type: PollenType, stationCode: string, timeStr: string) {
  const opName = POLLEN_SPECIES_INFO[type].endpoint;
  const url = `https://apis.data.go.kr/1360000/HealthWthrIdxServiceV3/${opName}?serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=1&dataType=JSON&areaNo=${stationCode}&time=${timeStr}`;
  
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.response?.header?.resultCode !== '00') return null;
  return data?.response?.body?.items?.item?.[0] || null;
}

const parseVal = (val: any): RiskLevel => {
  if (val === undefined || val === null || val === '') return 0;
  const num = parseInt(String(val), 10);
  if (isNaN(num) || num < 0) return 0;
  if (num > 3) return 3;
  return num as RiskLevel;
};

// 전국 17개 시도 과반수 3일 예보 인메모리 캐시 (30분 유효)
let nationwideDailyCache: {
  timeKey: string;
  timestamp: number;
  dailyRisks: RegionalDailyRisks;
} | null = null;

async function getNationwideDailyRisks(
  apiKey: string,
  timeStr: string,
  activeMonth: number
): Promise<RegionalDailyRisks> {
  const now = Date.now();
  if (
    nationwideDailyCache &&
    nationwideDailyCache.timeKey === timeStr &&
    now - nationwideDailyCache.timestamp < 30 * 60 * 1000
  ) {
    return nationwideDailyCache.dailyRisks;
  }

  const emptyRisks: RegionalDailyRisks = {
    today: {},
    tomorrow: {},
    dayAfterTomorrow: {},
  };
  REGIONS.forEach((r) => {
    emptyRisks.today[r.code] = 0;
    emptyRisks.tomorrow[r.code] = 0;
    emptyRisks.dayAfterTomorrow[r.code] = 0;
  });

  const activeTypes = getActivePollenTypes(activeMonth);
  if (!apiKey || activeTypes.length === 0) {
    nationwideDailyCache = { timeKey: timeStr, timestamp: now, dailyRisks: emptyRisks };
    return emptyRisks;
  }

  const dailyRisks: RegionalDailyRisks = {
    today: { ...emptyRisks.today },
    tomorrow: { ...emptyRisks.tomorrow },
    dayAfterTomorrow: { ...emptyRisks.dayAfterTomorrow },
  };

  try {
    // 17개 광역시도별로 관할 지점들 병렬 조회
    await Promise.all(
      REGIONS.map(async (region) => {
        const stations = KMA_REGION_STATIONS[region.code] || [{ code: region.code, name: region.name }];

        // 활성 수종별로 관할 지점들의 3일 예보 수집
        const typeDailyResults = await Promise.all(
          activeTypes.map(async (type) => {
            const stationResults = await Promise.all(
              stations.map(async (st) => {
                try {
                  const item = await fetchStationItem(apiKey, type, st.code, timeStr);
                  if (!item) return { today: 0, tomorrow: 0, dayAfterTomorrow: 0 };
                  const todayRaw = item.today !== '' ? item.today : item.tomorrow;
                  return {
                    today: parseVal(todayRaw),
                    tomorrow: parseVal(item.tomorrow),
                    dayAfterTomorrow: parseVal(item.dayaftertomorrow),
                  };
                } catch {
                  return { today: 0, tomorrow: 0, dayAfterTomorrow: 0 };
                }
              })
            );

            // 관할 구역이 여러 개인 곳은 "과반인 값"으로 단계 계산
            return {
              today: calculateMajorityRisk(stationResults.map((s) => s.today)) as RiskLevel,
              tomorrow: calculateMajorityRisk(stationResults.map((s) => s.tomorrow)) as RiskLevel,
              dayAfterTomorrow: calculateMajorityRisk(stationResults.map((s) => s.dayAfterTomorrow)) as RiskLevel,
            };
          })
        );

        // 참나무와 소나무가 동시 비산하는 봄철에는 둘 중 MAX 값 채택
        dailyRisks.today[region.code] = Math.max(...typeDailyResults.map((r) => r.today)) as RiskLevel;
        dailyRisks.tomorrow[region.code] = Math.max(...typeDailyResults.map((r) => r.tomorrow)) as RiskLevel;
        dailyRisks.dayAfterTomorrow[region.code] = Math.max(...typeDailyResults.map((r) => r.dayAfterTomorrow)) as RiskLevel;
      })
    );

    nationwideDailyCache = { timeKey: timeStr, timestamp: now, dailyRisks };
  } catch (err) {
    console.error('Nationwide daily risks fetch error:', err);
  }

  return dailyRisks;
}

function createEmptyPollenData(currentMonthNum: number): Record<PollenType, PollenForecastItem> {
  const activeTypes = getActivePollenTypes(currentMonthNum);
  return {
    oak: {
      type: 'oak',
      name: POLLEN_SPECIES_INFO.oak.name,
      season: POLLEN_SPECIES_INFO.oak.seasonText,
      isActiveSeason: activeTypes.includes('oak'),
      today: 0,
      tomorrow: 0,
      dayAfterTomorrow: 0,
      twoDaysAfterTomorrow: 0,
    },
    pine: {
      type: 'pine',
      name: POLLEN_SPECIES_INFO.pine.name,
      season: POLLEN_SPECIES_INFO.pine.seasonText,
      isActiveSeason: activeTypes.includes('pine'),
      today: 0,
      tomorrow: 0,
      dayAfterTomorrow: 0,
      twoDaysAfterTomorrow: 0,
    },
    weeds: {
      type: 'weeds',
      name: POLLEN_SPECIES_INFO.weeds.name,
      season: POLLEN_SPECIES_INFO.weeds.seasonText,
      isActiveSeason: activeTypes.includes('weeds'),
      today: 0,
      tomorrow: 0,
      dayAfterTomorrow: 0,
      twoDaysAfterTomorrow: 0,
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const areaNo = searchParams.get('areaNo') || '1100000000';
  const customApiKey = searchParams.get('apiKey') || '';

  const region = REGIONS.find((r) => r.code === areaNo) || REGIONS[0];
  const { timeStr, currentMonthNum, displayDate } = getKstDateTime();
  const apiKey = customApiKey || process.env.KMA_POLLEN_API_KEY || '';

  const defaultItems = createEmptyPollenData(currentMonthNum);
  const activeTypes = getActivePollenTypes(currentMonthNum);

  // 1. API 키가 없거나 비산기(활동 월)가 전혀 아닌 경우 -> 외부 호출 생략
  if (!apiKey || activeTypes.length === 0) {
    const isOff = activeTypes.length === 0;
    return NextResponse.json<PollenApiResponse>({
      success: isOff,
      isOffSeason: isOff,
      region,
      forecastDate: displayDate,
      items: defaultItems,
      maxTodayRisk: 0,
      regionalRisks: {},
      regionalDailyRisks: { today: {}, tomorrow: {}, dayAfterTomorrow: {} },
      message: isOff
        ? '현재는 꽃가루 비산 휴지기로 기상청에서 지수를 제공하지 않는 기간입니다.'
        : '공공데이터포털 API 인증키가 필요합니다.',
    });
  }

  try {
    const stations = KMA_REGION_STATIONS[region.code] || [{ code: region.code, name: region.name }];
    const liveItems = { ...defaultItems };

    // 활성 수종만 스마트하게 호출 (불필요한 호출 원천 배제)
    await Promise.all(
      activeTypes.map(async (type) => {
        const stationResults = await Promise.all(
          stations.map(async (st) => {
            try {
              const item = await fetchStationItem(apiKey, type, st.code, timeStr);
              if (!item) return { today: 0, tomorrow: 0, dayAfterTomorrow: 0, twoDays: 0 };
              const todayRaw = item.today !== '' ? item.today : item.tomorrow;
              return {
                today: parseVal(todayRaw),
                tomorrow: parseVal(item.tomorrow),
                dayAfterTomorrow: parseVal(item.dayaftertomorrow),
                twoDays: parseVal(item.twodaysaftertomorrow),
              };
            } catch {
              return { today: 0, tomorrow: 0, dayAfterTomorrow: 0, twoDays: 0 };
            }
          })
        );

        // 관할구역이 여러 개인 곳은 "과반인 값"으로 단계 계산
        const majorityToday = calculateMajorityRisk(stationResults.map((s) => s.today)) as RiskLevel;
        const majorityTomorrow = calculateMajorityRisk(stationResults.map((s) => s.tomorrow)) as RiskLevel;
        const majorityDayAfter = calculateMajorityRisk(stationResults.map((s) => s.dayAfterTomorrow)) as RiskLevel;
        const majorityTwoDays = calculateMajorityRisk(stationResults.map((s) => s.twoDays)) as RiskLevel;

        liveItems[type] = {
          type,
          name: POLLEN_SPECIES_INFO[type].name,
          season: POLLEN_SPECIES_INFO[type].seasonText,
          isActiveSeason: true,
          today: majorityToday,
          tomorrow: majorityTomorrow,
          dayAfterTomorrow: majorityDayAfter,
          twoDaysAfterTomorrow: majorityTwoDays,
          dateStr: timeStr,
        };
      })
    );

    // 전국 17개 시도 과반수 3일 예보 가져오기
    const regionalDailyRisks = await getNationwideDailyRisks(apiKey, timeStr, currentMonthNum);

    const maxTodayRisk = Math.max(
      liveItems.oak.today,
      liveItems.pine.today,
      liveItems.weeds.today
    ) as RiskLevel;

    return NextResponse.json<PollenApiResponse>({
      success: true,
      isOffSeason: false,
      region,
      forecastDate: displayDate,
      items: liveItems,
      maxTodayRisk,
      regionalRisks: regionalDailyRisks.today, // 기존 호환용
      regionalDailyRisks, // 오늘/내일/모레 일자별 전국 위험도
      message: '기상청 공공데이터를 관할 지점 과반수 집계로 정상 수신했습니다.',
    });
  } catch (err: any) {
    console.error('Pollen API route error:', err);
    return NextResponse.json<PollenApiResponse>({
      success: false,
      isOffSeason: false,
      error: `기상청 데이터를 불러오지 못했습니다 (${err.message || '네트워크 오류'})`,
      region,
      forecastDate: displayDate,
      items: defaultItems,
      maxTodayRisk: 0,
      message: '공공데이터포털 서버 통신 중 오류가 발생했습니다.',
    });
  }
}
