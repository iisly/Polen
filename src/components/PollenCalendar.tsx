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
    <div className="bg-white border border-[#ECE7DE] rounded-2xl p-6 sm:p-7 space-y-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-[#F4EFE6] pb-3.5">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-[#5F7556]" />
          <h3 className="text-lg sm:text-xl font-bold text-[#1F1D1A]">
            연간 꽃가루 달력
          </h3>
        </div>
        <span className="text-xs sm:text-sm text-[#544E47] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#EDE8E0] font-medium">
          현재는 <strong className="text-[#1F1D1A] font-bold">{currentMonth}월</strong>입니다
        </span>
      </div>

      {/* 넉넉한 3열(모바일 1열) 레이아웃 & 시원한 폰트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {ANNUAL_POLLEN_CALENDAR.map((item) => {
          const isThisMonth = item.month === currentMonth;

          return (
            <div
              key={item.month}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isThisMonth
                  ? 'border-[#5F7556] bg-[#FAF8F5] ring-1 ring-[#5F7556]/30 shadow-xs'
                  : 'border-[#EDE8E0] bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-baseline gap-2">
                  <span className={`text-base sm:text-lg font-extrabold ${isThisMonth ? 'text-[#1F1D1A]' : 'text-[#3A3530]'}`}>
                    {item.month}월
                  </span>
                  {isThisMonth && (
                    <span className="text-xs font-bold text-[#5F7556]">
                      이번 달
                    </span>
                  )}
                </div>

                <span className={`text-xs px-2.5 py-0.5 rounded-md ${getBadgeStyle(item.dangerLevel)}`}>
                  {item.statusText}
                </span>
              </div>

              {/* 잘리지 않고 선명한 본문 */}
              <p className="text-xs sm:text-sm text-[#4A443E] leading-relaxed break-keep font-medium mt-1">
                {item.mainCause}
              </p>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-xs sm:text-sm text-[#7A726A] border-t border-[#F7F4EE] leading-relaxed">
        💡 <strong>핵심 요약:</strong> 봄철(4~5월)은 참나무·소나무 등 수목류가 피크를 이루고, 가을철(8~10월)은 환삼덩굴·돼지풀·쑥 등 잡초류가 비염을 주로 유발합니다.
      </div>
    </div>
  );
}
