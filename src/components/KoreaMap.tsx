'use client';

import React, { useState } from 'react';
import { REGIONS } from '@/lib/constants';
import { Region, RiskLevel } from '@/types/pollen';
import { Navigation } from 'lucide-react';

interface KoreaMapProps {
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  regionalRisks?: Record<string, RiskLevel>;
}

interface ProvinceArea {
  code: string;
  name: string;
  shortName: string;
  d: string;
  cx: number;
  cy: number;
}

// 대한민국 17개 광역시도별 SVG 영역 폴리곤 좌표 (viewBox 0 0 300 380)
const PROVINCE_AREAS: ProvinceArea[] = [
  // 1. 강원특별자치도
  {
    code: '4200000000',
    name: '강원특별자치도',
    shortName: '강원',
    d: 'M 148 45 L 195 35 L 236 68 L 246 120 L 240 152 L 208 135 L 180 120 L 155 110 L 148 75 Z',
    cx: 196,
    cy: 88,
  },
  // 2. 경기도
  {
    code: '4100000000',
    name: '경기도',
    shortName: '경기',
    d: 'M 96 46 L 148 45 L 148 75 L 155 110 L 138 145 L 115 150 L 100 142 L 84 125 L 86 72 Z',
    cx: 134,
    cy: 118,
  },
  // 3. 서울특별시
  {
    code: '1100000000',
    name: '서울특별시',
    shortName: '서울',
    d: 'M 98 78 L 116 75 L 122 88 L 112 96 L 98 93 Z',
    cx: 108,
    cy: 86,
  },
  // 4. 인천광역시
  {
    code: '2800000000',
    name: '인천광역시',
    shortName: '인천',
    d: 'M 64 82 L 86 80 L 84 102 L 70 108 L 60 96 Z',
    cx: 72,
    cy: 94,
  },
  // 5. 충청북도
  {
    code: '4300000000',
    name: '충청북도',
    shortName: '충북',
    d: 'M 155 110 L 180 120 L 208 135 L 185 165 L 175 195 L 152 190 L 138 175 L 138 145 Z',
    cx: 168,
    cy: 152,
  },
  // 6. 충청남도
  {
    code: '4400000000',
    name: '충청남도',
    shortName: '충남',
    d: 'M 84 125 L 100 142 L 115 150 L 112 165 L 118 190 L 104 206 L 64 198 L 60 160 L 72 135 Z',
    cx: 84,
    cy: 168,
  },
  // 7. 세종특별자치시
  {
    code: '3611000000',
    name: '세종특별자치시',
    shortName: '세종',
    d: 'M 115 150 L 130 150 L 130 168 L 114 168 Z',
    cx: 122,
    cy: 159,
  },
  // 8. 대전광역시
  {
    code: '3000000000',
    name: '대전광역시',
    shortName: '대전',
    d: 'M 120 172 L 138 172 L 136 194 L 118 194 Z',
    cx: 128,
    cy: 183,
  },
  // 9. 경상북도
  {
    code: '4700000000',
    name: '경상북도',
    shortName: '경북',
    d: 'M 240 152 L 254 188 L 260 225 L 235 228 L 225 208 L 195 208 L 185 218 L 175 195 L 185 165 L 208 135 Z',
    cx: 218,
    cy: 172,
  },
  // 10. 대구광역시
  {
    code: '2700000000',
    name: '대구광역시',
    shortName: '대구',
    d: 'M 198 202 L 218 202 L 218 222 L 198 222 Z',
    cx: 208,
    cy: 212,
  },
  // 11. 전북특별자치도
  {
    code: '4500000000',
    name: '전북특별자치도',
    shortName: '전북',
    d: 'M 64 198 L 104 206 L 118 190 L 152 190 L 150 230 L 138 245 L 84 250 L 70 236 Z',
    cx: 108,
    cy: 222,
  },
  // 12. 경상남도
  {
    code: '4800000000',
    name: '경상남도',
    shortName: '경남',
    d: 'M 150 230 L 185 218 L 225 228 L 235 245 L 218 274 L 195 292 L 152 288 L 138 262 Z',
    cx: 180,
    cy: 260,
  },
  // 13. 울산광역시
  {
    code: '3100000000',
    name: '울산광역시',
    shortName: '울산',
    d: 'M 235 228 L 258 230 L 255 255 L 235 252 Z',
    cx: 246,
    cy: 242,
  },
  // 14. 부산광역시
  {
    code: '2600000000',
    name: '부산광역시',
    shortName: '부산',
    d: 'M 218 272 L 246 260 L 248 284 L 222 292 Z',
    cx: 233,
    cy: 279,
  },
  // 15. 전라남도
  {
    code: '4600000000',
    name: '전라남도',
    shortName: '전남',
    d: 'M 70 236 L 84 250 L 138 245 L 152 288 L 138 318 L 80 322 L 60 296 L 66 260 Z',
    cx: 96,
    cy: 302,
  },
  // 16. 광주광역시
  {
    code: '2900000000',
    name: '광주광역시',
    shortName: '광주',
    d: 'M 88 260 L 108 260 L 106 280 L 86 280 Z',
    cx: 97,
    cy: 270,
  },
  // 17. 제주특별자치도
  {
    code: '5000000000',
    name: '제주특별자치도',
    shortName: '제주',
    d: 'M 68 350 C 68 340 118 340 118 350 C 118 360 68 360 68 350 Z',
    cx: 93,
    cy: 350,
  },
];

export default function KoreaMap({
  selectedRegion,
  onSelectRegion,
  regionalRisks = {},
}: KoreaMapProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // 단계별 조각 채색 (웜 미니멀리즘 팔레트)
  const getRiskFillColor = (code: string) => {
    const risk = regionalRisks[code] ?? 0;
    switch (risk) {
      case 0:
        return '#ECE8DF'; // 0단계 낮음: 부드러운 웜 베이지
      case 1:
        return '#E5D3A6'; // 1단계 보통: 은은한 웜 골드/옐로우
      case 2:
        return '#DF9F86'; // 2단계 높음: 따뜻한 코랄/테라코타
      case 3:
        return '#C86350'; // 3단계 매우높음: 선명한 로즈 레드
      default:
        return '#ECE8DF';
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
      {/* 컴팩트 헤더 */}
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

      {/* 조각조각 행정구역 면적 SVG 지도 */}
      <div className="w-full max-w-[280px] aspect-[3/4] relative mx-auto my-auto">
        <svg
          viewBox="0 0 300 380"
          className="w-full h-full select-none"
        >
          {/* 한반도 배경 테두리 실루엣 (은은한 가이드) */}
          <path
            d="M 90 30 
               Q 135 20 185 40 
               Q 225 55 230 100 
               Q 255 140 240 200 
               Q 260 230 250 280 
               Q 225 305 180 300 
               Q 130 315 75 315 
               Q 70 260 90 225 
               Q 70 180 75 135 
               Q 60 100 90 60 Z"
            fill="#F6F3ED"
            stroke="#E5DFD4"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* 울릉도 & 독도: 심플한 위성 점 */}
          <circle cx="258" cy="110" r="3.2" fill="#D5CFC5" stroke="#C2BAB0" strokeWidth="0.8" />
          <circle cx="274" cy="116" r="2" fill="#D5CFC5" stroke="#C2BAB0" strokeWidth="0.8" />

          {/* 17개 행정구역 폴리곤 면적 (조각조각 인터랙션) */}
          {PROVINCE_AREAS.map((prov) => {
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
                {/* 행정구역 면적 조각 */}
                <path
                  d={prov.d}
                  fill={fillColor}
                  stroke={isSelected ? '#485941' : isHovered ? '#8E8578' : '#D8D1C5'}
                  strokeWidth={isSelected ? 2.8 : isHovered ? 2 : 1.2}
                  strokeLinejoin="round"
                  className="transition-colors duration-150"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 2px 6px rgba(72,89,65,0.3))' : undefined,
                  }}
                />

                {/* 선택 시 은은한 중심 원형 핀 */}
                {isSelected && (
                  <circle
                    cx={prov.cx}
                    cy={prov.cy}
                    r="4"
                    fill="#485941"
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                  />
                )}

                {/* 지명 라벨 */}
                <text
                  x={prov.cx}
                  y={prov.cy + (isSelected ? 13 : 4)}
                  textAnchor="middle"
                  className={`text-[11px] select-none pointer-events-none transition-all ${
                    isSelected
                      ? 'fill-[#1F1D1A] font-black text-[12px]'
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

      {/* 지도 하단 단계별 색상 범례 (직관적인 4단계 안내) */}
      <div className="pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-[11px] sm:text-xs text-[#7A726A] font-medium px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#ECE8DF] border border-[#DDD7CD]" />
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
