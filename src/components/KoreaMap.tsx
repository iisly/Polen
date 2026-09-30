'use client';

import React, { useState } from 'react';
import koreaMap from '@svg-maps/south-korea';
import { REGIONS } from '@/lib/constants';
import { Region, RiskLevel } from '@/types/pollen';
import { Navigation } from 'lucide-react';

interface KoreaMapProps {
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  regionalRisks?: Record<string, RiskLevel>;
}

// @svg-maps/south-korea location.id -> 기상청 행정구역코드(10자리) 및 라벨 좌표 (viewBox 0 0 524 631 기준)
interface RegionMeta {
  code: string;
  shortName: string;
  labelX: number;
  labelY: number;
  isMetropolis?: boolean;
}

const LOCATION_META: Record<string, RegionMeta> = {
  seoul: { code: '1100000000', shortName: '서울', labelX: 152, labelY: 127, isMetropolis: true },
  gyeonggi: { code: '4100000000', shortName: '경기', labelX: 180, labelY: 90 },
  incheon: { code: '2800000000', shortName: '인천', labelX: 108, labelY: 135, isMetropolis: true },
  gangwon: { code: '4200000000', shortName: '강원', labelX: 275, labelY: 95 },
  'north-chungcheong': { code: '4300000000', shortName: '충북', labelX: 243, labelY: 235 },
  'south-chungcheong': { code: '4400000000', shortName: '충남', labelX: 135, labelY: 250 },
  sejong: { code: '3611000000', shortName: '세종', labelX: 177, labelY: 245, isMetropolis: true },
  daejeon: { code: '3000000000', shortName: '대전', labelX: 192, labelY: 274, isMetropolis: true },
  'north-gyeongsang': { code: '4700000000', shortName: '경북', labelX: 315, labelY: 230 },
  daegu: { code: '2700000000', shortName: '대구', labelX: 300, labelY: 336, isMetropolis: true },
  ulsan: { code: '3100000000', shortName: '울산', labelX: 364, labelY: 367, isMetropolis: true },
  busan: { code: '2600000000', shortName: '부산', labelX: 345, labelY: 402, isMetropolis: true },
  'south-gyeongsang': { code: '4800000000', shortName: '경남', labelX: 280, labelY: 400 },
  'north-jeolla': { code: '4500000000', shortName: '전북', labelX: 170, labelY: 345 },
  gwangju: { code: '2900000000', shortName: '광주', labelX: 140, labelY: 408, isMetropolis: true },
  'south-jeolla': { code: '4600000000', shortName: '전남', labelX: 135, labelY: 455 },
  jeju: { code: '5000000000', shortName: '제주', labelX: 112, labelY: 609 },
};

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

  // 선택된 지역이 맨 위에 렌더링되도록 정렬 (외곽선 테두리 보호)
  const sortedLocations = [...koreaMap.locations].sort((a, b) => {
    const metaA = LOCATION_META[a.id];
    const metaB = LOCATION_META[b.id];
    if (metaA?.code === selectedRegion.code) return 1;
    if (metaB?.code === selectedRegion.code) return -1;
    return 0;
  });

  return (
    <div className="bg-white border border-[#ECE7DE] rounded-2xl p-3 sm:p-5 flex flex-col justify-between h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2 relative">
      {/* 🧭 내 위치 플로팅 버튼 (우측 상단 바다 위에 컴팩트하게 부유) */}
      <button
        onClick={handleDetectLocation}
        disabled={isLocating}
        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-[#E0D9CD] hover:bg-white hover:border-[#BCB3A4] active:scale-95 rounded-xl text-[#3A3530] shadow-xs transition text-xs font-bold"
        title="GPS로 내 위치 찾기"
      >
        <Navigation className={`w-3.5 h-3.5 text-[#5F7556] ${isLocating ? 'animate-spin' : ''}`} />
        <span>{isLocating ? '위치 탐색 중' : '내 위치'}</span>
      </button>

      {/* 업계 표준 @svg-maps/south-korea 기반 대한민국 17개 광역시도 정밀 벡터 지도 */}
      <div className="w-full max-w-[340px] aspect-[524/631] relative mx-auto my-auto flex items-center justify-center py-1">
        <svg
          viewBox={koreaMap.viewBox || '0 0 524 631'}
          className="w-full h-full select-none"
        >
          {/* 17개 광역시도 정밀 폴리곤 영역 */}
          {sortedLocations.map((loc) => {
            const meta = LOCATION_META[loc.id];
            if (!meta) return null;

            const isSelected = selectedRegion.code === meta.code;
            const isHovered = hoveredCode === meta.code;
            const fillColor = getRiskFillColor(meta.code);

            return (
              <g
                key={loc.id}
                className="cursor-pointer transition-all"
                onClick={() => {
                  const found = REGIONS.find((r) => r.code === meta.code);
                  if (found) onSelectRegion(found);
                }}
                onMouseEnter={() => setHoveredCode(meta.code)}
                onMouseLeave={() => setHoveredCode(null)}
              >
                {/* 행정구역 폴리곤 면적 */}
                <path
                  id={loc.id}
                  d={loc.path}
                  fill={fillColor}
                  stroke={isSelected ? '#2E2B27' : isHovered ? '#6B6357' : '#B8AFA0'}
                  strokeWidth={isSelected ? 3 : isHovered ? 1.8 : 1}
                  strokeLinejoin="round"
                  className="transition-colors duration-150"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 3px 8px rgba(46,43,39,0.35))' : undefined,
                  }}
                />

                {/* 지명 텍스트 라벨 (가독성을 위한 선명한 화이트 헤일로) */}
                <text
                  x={meta.labelX}
                  y={meta.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    paintOrder: 'stroke fill',
                    stroke: '#FAF8F5',
                    strokeWidth: isSelected ? '4px' : '3px',
                    strokeLinejoin: 'round',
                  }}
                  className={`select-none pointer-events-none transition-all ${
                    isSelected
                      ? 'fill-[#141312] font-black'
                      : isHovered
                      ? 'fill-[#1F1D1A] font-extrabold'
                      : 'fill-[#3A3530] font-bold'
                  } ${meta.isMetropolis ? 'text-[13px]' : 'text-[14px]'}`}
                >
                  {meta.shortName}
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
