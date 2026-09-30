'use client';

import React from 'react';
import { ANNUAL_POLLEN_CALENDAR } from '@/lib/constants';
import { Calendar } from 'lucide-react';

export default function PollenCalendar() {
  const currentMonth = new Date().getMonth() + 1;

  const getBadgeStyle = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-[#EDE9E1] text-[#544E47] font-semibold';
      case 1:
        return 'bg-[#F5EFE0] text-[#8C764D] font-bold';
      case 2:
        return 'bg-[#F8ECE6] text-[#A65B47] font-bold';
      case 3:
        return 'bg-[#F6E3DE] text-[#9E3622] font-black';
      default:
        return 'bg-[#EDE9E1] text-[#544E47]';
    }
  };

  return (
    <div className="bg-white border border-[#ECE7DE] rounded-2xl p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-[#F4EFE6] pb-3">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-[#5F7556]" />
          <h3 className="text-lg sm:text-xl font-bold text-[#1F1D1A]">
            연간 꽃가루 달력
          </h3>
        </div>
        <span className="text-xs sm:text-sm text-[#544E47] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#EDE8E0] font-bold whitespace-nowrap">
          현재는 <strong className="text-[#1F1D1A] font-extrabold">{currentMonth}월</strong>입니다
        </span>
      </div>

      {/* 4계절 핵심 요약 띠 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-[#544E47]">
        <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EDE8E0] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-[#7A726A] font-bold mb-1">
            <span>봄 (3~5월)</span>
            <span className="text-[#9E3622]">수목류 피크</span>
          </div>
          <span className="text-xs text-[#2D2A26] font-extrabold">참나무 · 소나무</span>
        </div>
        <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EDE8E0] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-[#7A726A] font-bold mb-1">
            <span>여름 (6~7월)</span>
            <span className="text-[#5F7556]">장마 휴지기</span>
          </div>
          <span className="text-xs text-[#2D2A26] font-extrabold">비산 거의 없음</span>
        </div>
        <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EDE8E0] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-[#7A726A] font-bold mb-1">
            <span>가을 (8~10월)</span>
            <span className="text-[#9E3622]">잡초류 피크</span>
          </div>
          <span className="text-xs text-[#2D2A26] font-extrabold">환삼덩굴 · 돼지풀</span>
        </div>
        <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EDE8E0] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-[#7A726A] font-bold mb-1">
            <span>겨울 (11~2월)</span>
            <span className="text-[#5F7556]">안전기</span>
          </div>
          <span className="text-xs text-[#2D2A26] font-extrabold">실내 환경 관리</span>
        </div>
      </div>

      {/* 모바일 2열 / 데스크톱 4열 달력 그리드 (스크롤 낭비 및 플러딩 해결) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
        {ANNUAL_POLLEN_CALENDAR.map((item) => {
          const isThisMonth = item.month === currentMonth;

          return (
            <div
              key={item.month}
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                isThisMonth
                  ? 'border-[#5F7556] bg-[#FAF8F5] ring-1 ring-[#5F7556]/30 shadow-xs'
                  : 'border-[#EDE8E0] bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-sm sm:text-base font-extrabold ${isThisMonth ? 'text-[#1F1D1A]' : 'text-[#3A3530]'}`}>
                    {item.month}월
                  </span>
                  {isThisMonth && (
                    <span className="text-[10px] font-extrabold text-[#5F7556] bg-[#EDEFEA] px-1 py-0.5 rounded whitespace-nowrap">
                      이번달
                    </span>
                  )}
                </div>

                <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${getBadgeStyle(item.dangerLevel)}`}>
                  {item.statusText}
                </span>
              </div>

              {/* 간결하고 시인성 높은 원인 설명 (줄바꿈 최적화) */}
              <p className="text-[11px] sm:text-xs text-[#544E47] leading-snug break-keep font-medium">
                {item.mainCause.split('(')[0]}
              </p>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-xs text-[#7A726A] border-t border-[#F7F4EE] leading-relaxed">
        💡 <strong>예방 행동 요령:</strong> 꽃가루 비산기 외출 시 보건용 마스크(KF)를 착용하고, 증상 완화 및 예방을 위해 외출 전 항히스타민제를 복용하세요.
      </div>
    </div>
  );
}
