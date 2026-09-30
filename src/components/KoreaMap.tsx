'use client';

import React, { useState } from 'react';
import { REGIONS } from '@/lib/constants';
import { Region, RiskLevel } from '@/types/pollen';
import { KOREA_PROVINCE_PATHS } from '@/lib/koreaProvincePaths';
import { Navigation } from 'lucide-react';

interface KoreaMapProps {
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  regionalRisks?: Record<string, RiskLevel>;
}

export default function KoreaMap({
  selectedRegion,
  onSelectRegion,
  regionalRisks = {},
}: KoreaMapProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // 기상청 실시간 위험 단계별 조각 채색 (웜 미니멀리즘 팔레트)
  const getRiskFillColor = (code: string) => {
    const risk = regionalRisks[code] ?? 0;
    switch (risk) {
      case 0:
        return '#EDE8DF'; // 0단계 낮음: 부드러운 웜 베이지
      case 1:
        return '#E5D3A6'; // 1단계 보통: 은은한 웜 골드/옐로우
      case 2:
        return '#DF9F86'; // 2단계 높음: 따뜻한 코랄/테라코타
      case 3:
        return '#C86350'; // 3단계 매우높음: 선명한 로즈 레드
      default:
        return '#EDE8DF';
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('위치 서비스를 지원하지 않는 브라우저입니다.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        let closest = REGIONS[0];
        let minD = Infinity;

        REGIONS.forEach((r) => {
          const d = Math.hypot(r.lat - userLat, r.lng - userLng);
          if (d < minD) {
            minD = d;
            closest = r;
          }
        });

        onSelectRegion(closest);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('위치 정보를 가져올 수 없습니다.');
      },
      { timeout: 5000 }
    );
  };

  return (
    <div className="bg-white border border-[#ECE7DE] rounded-2xl p-4 sm:p-6 flex flex-col justify-between h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-[#F4EFE6] pb-3">
        <div>
          <span className="font-bold text-[#2D2A26] text-sm sm:text-base">
            지역 선택
          </span>
          <span className="text-xs text-[#7A726A] ml-2 font-medium">
            (행정구역 클릭 시 변경)
          </span>
        </div>
        <button
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-[#E5DFD4] hover:bg-[#F2ECE1] rounded-lg text-[#4A443E] transition text-xs font-semibold"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? '확인 중' : '내 위치'}</span>
        </button>
      </div>

      {/* 정밀 지리 좌표 기반 대한민국 17개 광역시도 지도 */}
      <div className="w-full max-w-[290px] aspect-[3/4] relative mx-auto my-auto flex items-center justify-center">
        <svg
          viewBox="0 0 300 380"
          className="w-full h-full select-none"
        >
          {/* 동해 바다 울릉도 & 독도 */}
          <g className="cursor-default opacity-80">
            <circle cx="258" cy="110" r="3.5" fill="#D5CFC5" stroke="#C2BAB0" strokeWidth="0.8" />
            <circle cx="274" cy="116" r="2" fill="#D5CFC5" stroke="#C2BAB0" strokeWidth="0.8" />
          </g>

          {/* 17개 광역시도 정밀 폴리곤 영역 */}
          {KOREA_PROVINCE_PATHS.map((prov) => {
            const isSelected = selectedRegion.code === prov.code;
            const isHovered = hoveredCode === prov.code;
            const fillColor = getRiskFillColor(prov.code);

            return (
              <g
                key={prov.code}
                className="cursor-pointer transition-all"
                onClick={() => {
                  const found = REGIONS.find((r) => r.code === prov.code);
                  if (found) onSelectRegion(found);
                }}
                onMouseEnter={() => setHoveredCode(prov.code)}
                onMouseLeave={() => setHoveredCode(null)}
              >
                {/* 행정구역 폴리곤 면적 */}
                <path
                  d={prov.d}
                  fill={fillColor}
                  stroke={isSelected ? '#485941' : isHovered ? '#7A7264' : '#C8C1B4'}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.6 : 0.9}
                  strokeLinejoin="round"
                  className="transition-colors duration-150"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 2px 5px rgba(72,89,65,0.35))' : undefined,
                  }}
                />

                {/* 선택 시 은은한 핀 도트 */}
                {isSelected && (
                  <circle
                    cx={prov.cx}
                    cy={prov.cy}
                    r="3.5"
                    fill="#485941"
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                  />
                )}

                {/* 지명 텍스트 라벨 */}
                <text
                  x={prov.cx}
                  y={prov.cy + (isSelected ? 12 : 3.5)}
                  textAnchor="middle"
                  className={`text-[10.5px] select-none pointer-events-none transition-all ${
                    isSelected
                      ? 'fill-[#1F1D1A] font-black text-[11.5px]'
                      : isHovered
                      ? 'fill-[#1F1D1A] font-bold'
                      : 'fill-[#544E47] font-semibold'
                  }`}
                >
                  {prov.shortName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 지도 하단 단계별 색상 범례 */}
      <div className="pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-[11px] sm:text-xs text-[#7A726A] font-medium px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#EDE8DF] border border-[#DDD7CD]" />
          <span>0 낮음</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#E5D3A6] border border-[#D5C293]" />
          <span>1 보통</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#DF9F86] border border-[#CF8E75]" />
          <span>2 높음</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#C86350] border border-[#B75340]" />
          <span>3 매우높음</span>
        </div>
      </div>
    </div>
  );
}
