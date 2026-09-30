import { NextRequest, NextResponse } from 'next/server';
import { REGIONS, POLLEN_SPECIES_INFO } from '@/lib/constants';
import { PollenApiResponse, PollenForecastItem, PollenType, RiskLevel } from '@/types/pollen';

function getKstDateTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (9 * 3600000));
  
  const currentMonthNum = kst.getMonth() + 1;
  const hour = kst.getHours();

  let targetDate = kst;
  let baseHour = '06';

  // 기상청 꽃가루 위험지수는 매일 06:00, 18:00 하루 2회 발표됩니다.
  // 06:00 이전(새벽)에는 전일 18:00 발표 자료를 조회하고 표기합니다.
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

// 전국 17개 시도 위험도 인메모리 캐시 (30분 유효)
let nationwideCache: {
  timeKey: string;
  timestamp: number;
  risks: Record<string, RiskLevel>;
} | null = null;

async function getNationwideRisks(apiKey: string, timeStr: string, activeMonth: number): Promise<Record<string, RiskLevel>> {
  const now = Date.now();
  if (nationwideCache && nationwideCache.timeKey === timeStr && (now - nationwideCache.timestamp < 30 * 60 * 1000)) {
    return nationwideCache.risks;
  }

  const risks: Record<string, RiskLevel> = {};
  REGIONS.forEach((r) => { risks[r.code] = 0; });

  if (!apiKey) return risks;

  const activeTypes = (['oak', 'pine', 'weeds'] as PollenType[]).filter(
    (t) => POLLEN_SPECIES_INFO[t].seasonMonths.includes(activeMonth)
  );

  if (activeTypes.length === 0) {
    nationwideCache = { timeKey: timeStr, timestamp: now, risks };
    return risks;
  }

  try {
    await Promise.all(
      REGIONS.map(async (reg) => {
        try {
          const typePromises = activeTypes.map(async (t) => {
            const opName = POLLEN_SPECIES_INFO[t].endpoint;
            const url = `https://apis.data.go.kr/1360000/HealthWthrIdxServiceV3/${opName}?serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=1&dataType=JSON&areaNo=${reg.code}&time=${timeStr}`;
            const res = await fetch(url, { next: { revalidate: 1800 } });
            if (!res.ok) return 0;
            const data = await res.json();
            if (data?.response?.header?.resultCode !== '00') return 0;
            const item = data?.response?.body?.items?.item?.[0];
            if (!item) return 0;
            const rawVal = item.today !== '' ? item.today : item.tomorrow;
            const num = parseInt(String(rawVal), 10);
            return isNaN(num) || num < 0 ? 0 : num > 3 ? 3 : (num as RiskLevel);
          });
          const typeRisks = await Promise.all(typePromises);
          risks[reg.code] = Math.max(0, ...typeRisks) as RiskLevel;
        } catch {
          risks[reg.code] = 0;
        }
      })
    );
    nationwideCache = { timeKey: timeStr, timestamp: now, risks };
  } catch (err) {
    console.error('Nationwide risks fetch error:', err);
  }

  return risks;
}

// 모든 지수를 0(안전/비산기)으로 초기화
function createEmptyPollenData(currentMonthNum: number): Record<PollenType, PollenForecastItem> {
  const isOakActive = POLLEN_SPECIES_INFO.oak.seasonMonths.includes(currentMonthNum);
  const isPineActive = POLLEN_SPECIES_INFO.pine.seasonMonths.includes(currentMonthNum);
  const isWeedsActive = POLLEN_SPECIES_INFO.weeds.seasonMonths.includes(currentMonthNum);

  return {
    oak: {
      type: 'oak',
      name: '참나무',
      season: POLLEN_SPECIES_INFO.oak.seasonText,
      isActiveSeason: isOakActive,
      today: 0,
      tomorrow: 0,
      dayAfterTomorrow: 0,
      twoDaysAfterTomorrow: 0,
    },
    pine: {
      type: 'pine',
      name: '소나무 (송홧가루)',
      season: POLLEN_SPECIES_INFO.pine.seasonText,
      isActiveSeason: isPineActive,
      today: 0,
      tomorrow: 0,
      dayAfterTomorrow: 0,
      twoDaysAfterTomorrow: 0,
    },
    weeds: {
      type: 'weeds',
      name: '잡초류 (돼지풀·환삼덩굴)',
      season: POLLEN_SPECIES_INFO.weeds.seasonText,
      isActiveSeason: isWeedsActive,
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

  // 1. API 키가 아예 없는 경우 -> 솔직하게 안내
  if (!apiKey) {
    return NextResponse.json<PollenApiResponse>({
      success: false,
      isOffSeason: false,
      error: '공공데이터포털 API 인증키가 등록되지 않았습니다.',
      region,
      forecastDate: displayDate,
      items: defaultItems,
      maxTodayRisk: 0,
      message: '공공데이터포털에서 발급받은 인증키를 설정하시면 실시간 기상청 조회가 진행됩니다. 현재는 모든 수치가 기본 0으로 표시됩니다.',
    });
  }

  // 2. 기상청 API 실제 호출 시도
  try {
    const pollenTypes: PollenType[] = ['oak', 'pine', 'weeds'];
    let errorMsg: string | null = null;
    let hasLiveSuccess = false;

    const results = await Promise.allSettled(
      pollenTypes.map(async (type) => {
        const opName = POLLEN_SPECIES_INFO[type].endpoint;
        const url = `https://apis.data.go.kr/1360000/HealthWthrIdxServiceV3/${opName}?serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=10&dataType=JSON&areaNo=${areaNo}&time=${timeStr}`;

        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 300 }, // 5분 캐시
        });

        if (!res.ok) {
          throw new Error(`기상청 서버 HTTP ${res.status} 응답`);
        }

        const data = await res.json();
        const header = data?.response?.header;

        // resultCode '99': "해당지수자료 제공기간이 아닙니다" (예: 가을철 참나무/소나무)
        // 이는 에러가 아니라 해당 수종의 비산기가 아님을 의미하는 정상 응답입니다.
        if (header?.resultCode === '99') {
          return {
            type,
            name: POLLEN_SPECIES_INFO[type].name,
            season: POLLEN_SPECIES_INFO[type].seasonText,
            isActiveSeason: false,
            today: 0 as RiskLevel,
            tomorrow: 0 as RiskLevel,
            dayAfterTomorrow: 0 as RiskLevel,
            twoDaysAfterTomorrow: 0 as RiskLevel,
            dateStr: timeStr,
          };
        }

        if (header?.resultCode !== '00') {
          throw new Error(header?.resultMsg || '응답 오류');
        }

        const item = data?.response?.body?.items?.item?.[0];
        if (!item) {
          throw new Error('데이터 없음');
        }

        const parseVal = (val: any): RiskLevel => {
          if (val === undefined || val === null || val === '') return 0;
          const num = parseInt(String(val), 10);
          if (isNaN(num) || num < 0) return 0;
          if (num > 3) return 3;
          return num as RiskLevel;
        };

        const todayVal = parseVal(item.today);
        const tomorrowVal = parseVal(item.tomorrow);

        const forecastItem: PollenForecastItem = {
          type,
          name: POLLEN_SPECIES_INFO[type].name,
          season: POLLEN_SPECIES_INFO[type].seasonText,
          isActiveSeason: POLLEN_SPECIES_INFO[type].seasonMonths.includes(currentMonthNum),
          // 18시 이후 오늘 관측이 마감되어 빈 문자열("")로 올 경우 내일 예보 또는 0으로 보정
          today: item.today === '' ? tomorrowVal : todayVal,
          tomorrow: tomorrowVal,
          dayAfterTomorrow: parseVal(item.dayaftertomorrow),
          twoDaysAfterTomorrow: parseVal(item.twodaysaftertomorrow),
          dateStr: item.date,
        };

        return forecastItem;
      })
    );

    // 응답 취합
    const liveItems = { ...defaultItems };
    results.forEach((res, idx) => {
      const type = pollenTypes[idx];
      if (res.status === 'fulfilled' && res.value) {
        liveItems[type] = res.value;
        hasLiveSuccess = true;
      } else if (res.status === 'rejected' && !errorMsg) {
        errorMsg = res.reason?.message || '알 수 없는 오류';
      }
    });

    const regionalRisks = await getNationwideRisks(apiKey, timeStr, currentMonthNum);

    if (hasLiveSuccess) {
      const maxTodayRisk = Math.max(liveItems.oak.today, liveItems.pine.today, liveItems.weeds.today) as RiskLevel;
      return NextResponse.json<PollenApiResponse>({
        success: true,
        isOffSeason: false,
        region,
        forecastDate: displayDate,
        items: liveItems,
        maxTodayRisk,
        regionalRisks,
        message: '기상청 공공데이터를 정상적으로 실시간 수신했습니다.',
      });
    }

    // 3. 실시간 호출 실패 시 솔직하게 에러 반환 (가짜 데이터 없음, 기본 0)
    return NextResponse.json<PollenApiResponse>({
      success: false,
      isOffSeason: false,
      error: errorMsg ? `기상청 데이터를 불러오지 못했습니다: ${errorMsg}` : '기상청 API 응답을 불러오지 못했습니다.',
      region,
      forecastDate: displayDate,
      items: defaultItems,
      maxTodayRisk: 0,
      regionalRisks,
      message: '기상청 공공데이터포털 서버 연결 실패 또는 서비스 점검 중으로 실시간 데이터를 수신하지 못했습니다. (비산기가 아닌 수종은 기본 0으로 표시됩니다.)',
    });
  } catch (err: any) {
    // 4. 예외 발생 시 솔직한 에러 알림
    return NextResponse.json<PollenApiResponse>({
      success: false,
      isOffSeason: false,
      error: `기상청 데이터를 불러오지 못했습니다 (${err.message || '네트워크 오류'})`,
      region,
      forecastDate: displayDate,
      items: defaultItems,
      maxTodayRisk: 0,
      message: '공공데이터포털 서버와의 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    });
  }
}
