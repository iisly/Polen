'use client';

import React from 'react';
import { RotateCw } from 'lucide-react';

interface HeaderProps {
  isLiveConnected: boolean;
  forecastDate?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function Header({
  isLiveConnected,
  forecastDate,
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
        <div className="flex items-center gap-3 text-sm text-[#5C554E]">
          {/* 발표 시각 안내 */}
          {forecastDate && (
            <span className="text-xs text-[#8C827A] hidden md:inline">
              {forecastDate}
            </span>
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
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-[#7A726A] hover:text-[#2D2A26] hover:bg-[#F0ECE4] rounded-lg transition"
              title="새로고침"
              aria-label="데이터 새로고침"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
