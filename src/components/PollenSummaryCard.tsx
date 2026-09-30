'use client';

import React, { useState } from 'react';
import { RiskLevel, PollenForecastItem, PollenType, Region } from '@/types/pollen';

interface PollenSummaryCardProps {
  maxTodayRisk: RiskLevel;
  items: Record<PollenType, PollenForecastItem>;
  region: Region;
  forecastDate: string;
}

type ForecastDay = 'today' | 'tomorrow' | 'dayAfterTomorrow';

export default function PollenSummaryCard({
  items,
  region,
  forecastDate,
}: PollenSummaryCardProps) {
  const [selectedDay, setSelectedDay] = useState<ForecastDay>('today');

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

  const getRiskInfo = (level: RiskLevel) => {
    switch (level) {
      case 0:
        return {
          title: '안전',
          sub: '꽃가루 영향이 거의 없어 외출과 실내 환기에 자유롭습니다.',
          dotColor: 'bg-[#5F7556]',
          barColor: '#5F7556',
        };
      case 1:
        return {
          title: '보통',
          sub: '예민한 비염 환자는 외출 시 마스크를 챙기세요.',
          dotColor: 'bg-[#BFA15F]',
          barColor: '#BFA15F',
        };
      case 2:
        return {
          title: '높음',
          sub: '꽃가루 비산량이 많습니다. 외출 시 KF 마스크를 착용하세요.',
          dotColor: 'bg-[#C28C7E]',
          barColor: '#C28C7E',
        };
      case 3:
        return {
          title: '매우높음',
          sub: '야외 활동을 자제하고 귀가 후 즉시 코세척을 권장합니다.',
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
    { key: 'oak', label: '참나무', season: '봄 (4~6월)' },
    { key: 'pine', label: '소나무', season: '봄 (4~6월)' },
    { key: 'weeds', label: '잡초류', season: '가을 (8~10월)' },
  ];

  return (
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
                    {isActive ? '단계' : '비산기외'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
