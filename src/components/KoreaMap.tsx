'use client';

import React, { useState } from 'react';
import { REGIONS } from '@/lib/constants';
import { Region, RiskLevel } from '@/types/pollen';
import { KOREA_PROVINCE_PATHS } from '@/lib/koreaProvincePaths';

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

  // 선택된 지역이 맨 위에 렌더링되도록 정렬 (테두리 하이라이트 보호)
  const sortedProvinces = [...KOREA_PROVINCE_PATHS].sort((a, b) => {
    if (a.code === selectedRegion.code) return 1;
    if (b.code === selectedRegion.code) return -1;
    return 0;
  });

  return (
    <div className="bg-white border border-[#ECE7DE] rounded-2xl p-3 sm:p-5 flex flex-col justify-between h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
      {/* 넉넉하고 시원한 정밀 지리 좌표 기반 대한민국 17개 광역시도 지도 */}
      <div className="w-full max-w-[320px] aspect-[3/4] relative mx-auto my-auto flex items-center justify-center py-1">
        <svg
          viewBox="0 0 300 380"
          className="w-full h-full select-none"
        >
          {/* 동해 울릉도 & 독도 */}
          <g className="cursor-default opacity-85">
            <circle cx="278" cy="112" r="3.2" fill="#D5CFC5" stroke="#C2BAB0" strokeWidth="0.8" />
            <circle cx="293" cy="117" r="1.8" fill="#D5CFC5" stroke="#C2BAB0" strokeWidth="0.8" />
          </g>

          {/* 17개 광역시도 정밀 폴리곤 영역 */}
          {sortedProvinces.map((prov) => {
            const isSelected = selectedRegion.code === prov.code;
            const isHovered = hoveredCode === prov.code;
            const fillColor = getRiskFillColor(prov.code);

            const isSmallMetropolis = ['1100000000', '3611000000', '3000000000', '2900000000', '2700000000', '3100000000', '2600000000'].includes(prov.code);

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
                  stroke={isSelected ? '#354830' : isHovered ? '#736B5E' : '#C7BFB1'}
                  strokeWidth={isSelected ? 2.6 : isHovered ? 1.5 : 0.8}
                  strokeLinejoin="round"
                  className="transition-colors duration-150"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 2px 6px rgba(53,72,48,0.4))' : undefined,
                  }}
                />

                {/* 지명 텍스트 라벨 (진짜 정중앙 정렬 + 흰색 외곽선 헤일로) */}
                <text
                  x={prov.cx}
                  y={prov.cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    paintOrder: 'stroke fill',
                    stroke: '#FAF8F5',
                    strokeWidth: isSelected ? '3.5px' : '2.8px',
                    strokeLinejoin: 'round',
                  }}
                  className={`select-none pointer-events-none transition-all ${
                    isSelected
                      ? 'fill-[#141312] font-black'
                      : isHovered
                      ? 'fill-[#1F1D1A] font-extrabold'
                      : 'fill-[#3A3530] font-bold'
                  } ${isSmallMetropolis ? 'text-[10px]' : 'text-[11px]'}`}
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
