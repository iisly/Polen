'use client';

import React from 'react';
import { RotateCw } from 'lucide-react';

interface HeaderProps {
  isLiveConnected: boolean;
  forecastDate?: string;
  lastCheckedText?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function Header({
  isLiveConnected,
  forecastDate,
  lastCheckedText,
  onRefresh,
  isLoading = false,
}: HeaderProps) {
  return (
    <header className="border-b border-[#ECE7DE] bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#5F7556]" />
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-xl font-bold text-[#2D2A26] tracking-tight">
              Polen
            </h1>
            <span className="text-sm text-[#7A726A] font-medium hidden sm:inline">
              꽃가루 알레르기 케어
            </span>
          </div>
        </div>

        {/* 우측 컨트롤 */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-sm text-[#5C554E]">
          {/* 발표 시각 및 최근 확인 시각 안내 */}
          {forecastDate && (
            <div
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#8C827A]"
              title="기상청 꽃가루 위험지수는 매일 06:00, 18:00 하루 2회 발표됩니다"
            >
              <span>{isLoading ? '기상청 동기화 중...' : forecastDate}</span>
              {!isLoading && lastCheckedText && (
                <span className="text-[#A69C93]">· {lastCheckedText}</span>
              )}
            </div>
          )}

          {/* 상태 배지 */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0ECE4] text-[#4A443E]">
            <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-[#5F7556]' : 'bg-[#C28C7E]'}`} />
            <span className="text-xs font-medium">
              {isLiveConnected ? '기상청 실시간' : '기상청 미연결'}
            </span>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-[#7A726A] hover:text-[#2D2A26] hover:bg-[#F0ECE4] active:scale-95 disabled:opacity-60 rounded-lg transition cursor-pointer"
              title="기상청 최신 데이터 다시 조회 (일 2회 06·18시 발표)"
              aria-label="데이터 새로고침"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#2D2A26]' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
