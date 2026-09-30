'use client';

import React, { useState } from 'react';
import { RiskLevel, PollenForecastItem, PollenType, Region } from '@/types/pollen';

interface PollenSummaryCardProps {
  maxTodayRisk: RiskLevel;
  items: Record<PollenType, PollenForecastItem>;
  region: Region;
  forecastDate: string;
  selectedDay?: 'today' | 'tomorrow' | 'dayAfterTomorrow';
  onSelectDay?: (day: 'today' | 'tomorrow' | 'dayAfterTomorrow') => void;
}

export type ForecastDay = 'today' | 'tomorrow' | 'dayAfterTomorrow';

const RESPONSE_GUIDELINES = [
  {
    level: 3,
    step: '매우높음',
    range: '3단계',
    badgeClass: 'bg-[#FBE8E5] text-[#9E3622] border-[#F2C5BD]',
    tips: [
      '거의 모든 꽃가루 알레르기 환자에게서 증상이 나타날 수 있으므로 가급적 외출을 자제하고 실내에 머물러야 함',
      '부득이하게 외출을 할 경우에는 선글라스, 마스크 등을 반드시 착용',
      '창문을 닫아 꽃가루의 실내 유입을 막음',
      '알레르기 환자의 경우 증상이 심해지면 전문의를 방문함',
    ],
  },
  {
    level: 2,
    step: '높음',
    range: '2단계',
    badgeClass: 'bg-[#FDF0EC] text-[#B85438] border-[#F7D2C4]',
    tips: [
      '대개의 꽃가루 알레르기 환자에게서 증상이 나타날 수 있으므로 가급적 야외 활동을 자제함',
      '외출 시에는 선글라스, 마스크 등을 착용',
      '외출 후 손과 얼굴을 씻고, 취침 전 샤워를 하여 침구류에 꽃가루가 묻지 않게 하기',
    ],
  },
  {
    level: 1,
    step: '보통',
    range: '1단계',
    badgeClass: 'bg-[#FAF4E5] text-[#8C6D23] border-[#EFE0B8]',
    tips: [
      '꽃가루 알레르기가 약한 환자에게서 증상이 나타날 수 있으므로, 알레르기 환자는 야외 활동 시 선글라스, 마스크 등을 착용하도록 주의함',
    ],
  },
  {
    level: 0,
    step: '낮음',
    range: '0단계',
    badgeClass: 'bg-[#EFF5EC] text-[#406838] border-[#CCE2C4]',
    tips: [
      '꽃가루 알레르기가 심한 환자는 증상이 나타날 수 있음',
    ],
  },
];

export default function PollenSummaryCard({
  items,
  region,
  forecastDate,
  selectedDay: controlledSelectedDay,
  onSelectDay,
}: PollenSummaryCardProps) {
  const [internalDay, setInternalDay] = useState<ForecastDay>('today');
  const selectedDay = controlledSelectedDay ?? internalDay;
  const setSelectedDay = (day: ForecastDay) => {
    if (onSelectDay) onSelectDay(day);
    else setInternalDay(day);
  };

  const getSpeciesRisk = (type: PollenType, day: ForecastDay): RiskLevel => {
    const item = items[type];
    if (!item) return 0;
    if (day === 'today') return item.today;
    if (day === 'tomorrow') return item.tomorrow;
    return item.dayAfterTomorrow;
  };

  const calcMaxRisk = (day: ForecastDay): RiskLevel => {
    return Math.max(
      getSpeciesRisk('oak', day),
      getSpeciesRisk('pine', day),
      getSpeciesRisk('weeds', day)
    ) as RiskLevel;
  };

  const dayRisk = calcMaxRisk(selectedDay);

  const [showGuidelines, setShowGuidelines] = useState(false);

  const getRiskInfo = (level: RiskLevel) => {
    switch (level) {
      case 0:
        return {
          title: '낮음',
          sub: '꽃가루 알레르기가 심한 환자는 증상이 나타날 수 있습니다.',
          dotColor: 'bg-[#5F7556]',
          barColor: '#5F7556',
        };
      case 1:
        return {
          title: '보통',
          sub: '꽃가루 알레르기가 약한 환자도 증상이 나타날 수 있으므로 야외 활동 시 마스크, 선글라스를 착용하세요.',
          dotColor: 'bg-[#BFA15F]',
          barColor: '#BFA15F',
        };
      case 2:
        return {
          title: '높음',
          sub: '대개의 환자에게서 증상이 나타날 수 있으므로 가급적 야외 활동을 자제하고 외출 후 샤워를 권장합니다.',
          dotColor: 'bg-[#C28C7E]',
          barColor: '#C28C7E',
        };
      case 3:
        return {
          title: '매우높음',
          sub: '거의 모든 환자에게 증상이 나타날 수 있으므로 외출을 자제하고 창문을 닫으세요. 증상 심화 시 전문의를 방문하세요.',
          dotColor: 'bg-[#A85848]',
          barColor: '#A85848',
        };
    }
  };

  const status = getRiskInfo(dayRisk);

  const days: { key: ForecastDay; label: string; risk: RiskLevel }[] = [
    { key: 'today', label: '오늘', risk: calcMaxRisk('today') },
    { key: 'tomorrow', label: '내일', risk: calcMaxRisk('tomorrow') },
    { key: 'dayAfterTomorrow', label: '모레', risk: calcMaxRisk('dayAfterTomorrow') },
  ];

  const speciesList: { key: PollenType; label: string; season: string }[] = [
    { key: 'oak', label: '참나무', season: '봄 (3~6월)' },
    { key: 'pine', label: '소나무', season: '봄 (3~6월)' },
    { key: 'weeds', label: '잡초류', season: '가을 (8~10월)' },
  ];

  return (
    <>
      <div className="bg-white border border-[#ECE7DE] rounded-2xl p-5 sm:p-7 flex flex-col justify-between h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
      {/* 상단: 지역명 & 오늘/내일/모레 탭 (모바일 줄바꿈 방지) */}
      <div>
        <div className="flex items-center justify-between text-xs sm:text-sm text-[#7A726A] mb-2.5">
          <span className="font-semibold text-[#4A443E]">{region.name} 기상청 예보</span>
          <span className="text-xs text-[#9E958C]">{forecastDate}</span>
        </div>

        {/* 3일 예보 선택 탭 버튼 (whitespace-nowrap & 모바일 최적화) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 bg-[#FAF8F5] border border-[#ECE7DE] rounded-xl mb-4">
          {days.map((d) => {
            const isCurrent = selectedDay === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedDay(d.key)}
                className={`py-2 px-1.5 sm:px-3 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap select-none ${
                  isCurrent
                    ? 'bg-white text-[#1F1D1A] font-bold shadow-xs border border-[#DFD8CC]'
                    : 'text-[#635C54] hover:text-[#1F1D1A] font-medium'
                }`}
              >
                <span>{d.label}</span>
                <span className={`text-[11px] sm:text-xs px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${
                  d.risk === 0 ? 'bg-[#EDE9E1] text-[#544E47]' : 'bg-[#F7ECE9] text-[#9E3622]'
                }`}>
                  {d.risk}단계
                </span>
              </button>
            );
          })}
        </div>

        {/* 선택 일자 종합 지수 (중복 라벨 제거) */}
        <div className="flex items-baseline justify-between gap-2 border-b border-[#F4EFE6] pb-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${status.dotColor}`} />
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#1F1D1A] tracking-tight whitespace-nowrap">
                {days.find((d) => d.key === selectedDay)?.label} 위험도
              </span>
              <span className="text-xs sm:text-sm px-2 py-0.5 rounded-full bg-[#F5F2EB] text-[#4A443E] font-bold whitespace-nowrap">
                {dayRisk}단계
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-[#1F1D1A]">
              {status.title}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#4A443E] leading-relaxed font-medium mb-3">
          {status.sub}
        </p>

        {/* 현재 일자의 0~3 위험 단계 게이지 바 (직접 연결) */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 gap-2 h-2.5 bg-[#F5F2EB] rounded-full overflow-hidden">
            {[0, 1, 2, 3].map((lvl) => {
              const isFilled = dayRisk >= lvl;
              return (
                <div
                  key={lvl}
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFilled ? status.dotColor : 'bg-transparent'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] sm:text-xs text-[#8C827A] px-1 font-medium">
            <span>0 낮음</span>
            <span>1 보통</span>
            <span>2 높음</span>
            <span>3 매우높음</span>
          </div>
        </div>
      </div>

      {/* 3대 수종별 선택 일자 위험도 (줄바꿈 방지) */}
      <div className="space-y-2">
        <span className="text-xs sm:text-sm font-bold text-[#544E47] block">
          수종별 {days.find((d) => d.key === selectedDay)?.label} 예보
        </span>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center">
          {speciesList.map(({ key, label, season }) => {
            const risk = getSpeciesRisk(key, selectedDay);
            const isActive = items[key]?.isActiveSeason ?? false;

            return (
              <div
                key={key}
                className="p-2.5 sm:p-3 rounded-xl border border-[#EDE8E0] bg-[#FAF8F5] flex flex-col justify-between"
              >
                <div>
                  <span className="font-bold text-[#1F1D1A] block text-xs sm:text-sm whitespace-nowrap">
                    {label}
                  </span>
                  <span className="text-[11px] text-[#7A726A] block mt-0.5 whitespace-nowrap">
                    {season.split(' ')[0]}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#EAE5DC] flex items-baseline justify-center gap-1 whitespace-nowrap">
                  <span className="font-black text-[#1F1D1A] text-base sm:text-lg">
                    {risk}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#7A726A] whitespace-nowrap">
                    {isActive ? '단계' : '(비산기 아님)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 기상청 공식 단계별 대응요령 모달 호출 버튼 */}
      <div className="pt-2 border-t border-[#F2ECE1]">
        <button
          type="button"
          onClick={() => setShowGuidelines(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F2EDE4] active:scale-[0.99] border border-[#ECE7DE] text-xs sm:text-sm font-semibold text-[#544E47] hover:text-[#1F1D1A] transition-all flex items-center justify-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
        >
          <span>📋</span>
          <span>기상청 단계별 대응요령 안내</span>
        </button>
      </div>
    </div>

    {/* 대시보드를 해치지 않고 스윽 뜨는 공식 대응요령 모달 (카드 외부 분리로 레이아웃 절대 불변) */}
    {showGuidelines && (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setShowGuidelines(false)}
      >
        <div
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#ECE7DE] p-5 sm:p-6 flex flex-col max-h-[88vh] overflow-hidden transition-all transform animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#ECE7DE]">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📋</span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1F1D1A]">
                  기상청 꽃가루 위험지수 단계별 대응요령
                </h3>
                <p className="text-[11px] sm:text-xs text-[#8C827A] mt-0.5">
                  현재 선택: <span className="font-semibold text-[#4A443E]">{days.find((d) => d.key === selectedDay)?.label} ({dayRisk}단계 {status.title})</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGuidelines(false)}
              className="p-1.5 rounded-lg text-[#8C827A] hover:text-[#1F1D1A] hover:bg-[#F2EDE4] active:scale-90 transition-all cursor-pointer group"
              aria-label="닫기"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 모달 본문 - 플러딩 없는 모던 카드 리스트 */}
          <div className="mt-4 overflow-y-auto space-y-2.5 pr-1 text-xs">
            {RESPONSE_GUIDELINES.map((item) => {
              const isSelected = dayRisk === item.level;
              return (
                <div
                  key={item.step}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#CBBDAA] bg-[#FBF9F5] shadow-xs'
                      : 'border-[#EDE8E0] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${item.badgeClass}`}
                      >
                        {item.step}
                      </span>
                      <span className="text-[11px] text-[#7A726A] font-medium">
                        {item.range}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-[#7A5B3E] bg-[#EFE7D8] px-2 py-0.5 rounded-full">
                        현재 해당 단계
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1.5 pl-0.5">
                    {item.tips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-[#4A443E] leading-relaxed text-xs sm:text-[13px]"
                      >
                        <span className="text-[#9E958C] select-none text-[10px] mt-1 shrink-0">●</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* 모달 하단 - 의학자문 및 마우스 오버 반응형 닫기 버튼 */}
          <div className="pt-3.5 mt-3 border-t border-[#ECE7DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#8C827A]">
            <p className="leading-relaxed">
              ※ 의학자문: 서울대학병원 운영 서울특별시 보라매 병원 내과 김덕겸, 허응영 서울의대 교수
            </p>
            <button
              type="button"
              onClick={() => setShowGuidelines(false)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2D2A26] hover:bg-[#48423B] active:bg-[#1A1816] active:scale-95 text-white text-xs font-semibold shrink-0 transition-all duration-150 whitespace-nowrap text-center shadow-xs hover:shadow-md cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
