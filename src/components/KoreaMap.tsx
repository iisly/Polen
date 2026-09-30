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
  selectedDay?: 'today' | 'tomorrow' | 'dayAfterTomorrow';
}

// @svg-maps/south-korea location.id -> 기상청 행정구역코드(10자리) 및 정밀 라벨 좌표 (viewBox 0 0 524 631 기준)
interface RegionMeta {
  code: string;
  shortName: string;
  labelX: number;
  labelY: number;
  isMetropolis?: boolean;
}

const LOCATION_META: Record<string, RegionMeta> = {
  seoul: { code: '1100000000', shortName: '서울', labelX: 152, labelY: 127, isMetropolis: true },
  gyeonggi: { code: '4100000000', shortName: '경기', labelX: 175, labelY: 88 },
  incheon: { code: '2800000000', shortName: '인천', labelX: 106, labelY: 135, isMetropolis: true },
  gangwon: { code: '5100000000', shortName: '강원', labelX: 275, labelY: 95 },
  // 충북: 청주-충주 내륙 본토 정중앙 안착 (기존 243, 235는 경북 문경 이탈 문제 해결)
  'north-chungcheong': { code: '4300000000', shortName: '충북', labelX: 215, labelY: 205 },
  // 충남: 서산-홍성-예산 중심
  'south-chungcheong': { code: '4400000000', shortName: '충남', labelX: 130, labelY: 250 },
  // 세종: 대전(275)과 충분한 수직 간격(37px) 확보
  sejong: { code: '3611000000', shortName: '세종', labelX: 172, labelY: 238, isMetropolis: true },
  // 대전: 세종 남동쪽 대전 분지 중심
  daejeon: { code: '3000000000', shortName: '대전', labelX: 192, labelY: 275, isMetropolis: true },
  // 경북: 안동-의성 내륙 중심
  'north-gyeongsang': { code: '4700000000', shortName: '경북', labelX: 320, labelY: 235 },
  daegu: { code: '2700000000', shortName: '대구', labelX: 300, labelY: 336, isMetropolis: true },
  ulsan: { code: '3100000000', shortName: '울산', labelX: 364, labelY: 365, isMetropolis: true },
  // 부산: 경남/바다에 가려지지 않도록 부산 중심부 정밀 배치
  busan: { code: '2600000000', shortName: '부산', labelX: 348, labelY: 398, isMetropolis: true },
  'south-gyeongsang': { code: '4800000000', shortName: '경남', labelX: 275, labelY: 400 },
  'north-jeolla': { code: '5200000000', shortName: '전북', labelX: 165, labelY: 345 },
  gwangju: { code: '2900000000', shortName: '광주', labelX: 140, labelY: 408, isMetropolis: true },
  'south-jeolla': { code: '4600000000', shortName: '전남', labelX: 135, labelY: 455 },
  jeju: { code: '5000000000', shortName: '제주', labelX: 112, labelY: 609 },
};

export default function KoreaMap({
  selectedRegion,
  onSelectRegion,
  regionalRisks = {},
  selectedDay = 'today',
}: KoreaMapProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const dayLabel = selectedDay === 'tomorrow' ? '내일 예보' : selectedDay === 'dayAfterTomorrow' ? '모레 예보' : '오늘 예보';

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

  // 선택된 지역 폴리곤이 맨 위에 렌더링되도록 정렬 (외곽선 테두리 보호)
  const sortedLocations = [...koreaMap.locations].sort((a, b) => {
    const metaA = LOCATION_META[a.id];
    const metaB = LOCATION_META[b.id];
    if (metaA?.code === selectedRegion.code) return 1;
    if (metaB?.code === selectedRegion.code) return -1;
    return 0;
  });

  return (
    <div className="bg-white border border-[#ECE7DE] rounded-2xl p-2 sm:p-4 flex flex-col justify-center items-center h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden min-h-[380px] sm:min-h-[460px]">
      {/* 🧭 내 위치 플로팅 버튼 (우측 상단 바다 위에 부유) */}
      <button
        onClick={handleDetectLocation}
        disabled={isLocating}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-[#E0D9CD] hover:bg-white hover:border-[#BCB3A4] active:scale-95 rounded-xl text-[#3A3530] shadow-xs transition text-xs font-bold"
        title="GPS로 내 위치 찾기"
      >
        <Navigation className={`w-3.5 h-3.5 text-[#5F7556] ${isLocating ? 'animate-spin' : ''}`} />
        <span>{isLocating ? '위치 탐색 중' : '내 위치'}</span>
      </button>

      {/* 🎨 위험도 단계 플로팅 인디케이터 (우측 하단 바다 위에 컴팩트하게 세로 부유) */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1 sm:gap-1.5 px-2.5 py-2 bg-white/90 backdrop-blur-md border border-[#E0D9CD] rounded-xl shadow-xs text-[10px] sm:text-[11px] text-[#544E47] font-bold">
        <span className="text-[10px] text-[#5F7556] font-extrabold pb-1 border-b border-[#EAE5DC] block text-center">
          {dayLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#EDE8DF] border border-[#DDD7CD] shrink-0" />
          <span>0 낮음</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#E5D3A6] border border-[#D5C293] shrink-0" />
          <span>1 보통</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#DF9F86] border border-[#CF8E75] shrink-0" />
          <span>2 높음</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#C86350] border border-[#B75340] shrink-0" />
          <span>3 매우높음</span>
        </div>
      </div>

      {/* 업계 표준 @svg-maps/south-korea 기반 대한민국 17개 광역시도 대형 정밀 벡터 지도 */}
      <div className="w-full h-full max-w-[420px] aspect-[524/631] relative mx-auto my-auto flex items-center justify-center p-1 sm:p-2">
        <svg
          viewBox={koreaMap.viewBox || '0 0 524 631'}
          className="w-full h-full select-none"
        >
          {/* LAYER 1: 17개 광역시도 면적 폴리곤 (모든 면적을 글씨보다 아래에 먼저 렌더링하여 글씨 가림 완전 차단) */}
          <g id="map-polygons">
            {sortedLocations.map((loc) => {
              const meta = LOCATION_META[loc.id];
              if (!meta) return null;

              const isSelected = selectedRegion.code === meta.code;
              const isHovered = hoveredCode === meta.code;
              const fillColor = getRiskFillColor(meta.code);

              return (
                <path
                  key={loc.id}
                  id={loc.id}
                  d={loc.path}
                  fill={fillColor}
                  stroke={isSelected ? '#24201C' : isHovered ? '#6B6357' : '#B8AFA0'}
                  strokeWidth={isSelected ? 3.2 : isHovered ? 2 : 1}
                  strokeLinejoin="round"
                  className="cursor-pointer transition-colors duration-150"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 3px 8px rgba(36,32,28,0.4))' : undefined,
                  }}
                  onClick={() => {
                    const found = REGIONS.find((r) => r.code === meta.code);
                    if (found) onSelectRegion(found);
                  }}
                  onMouseEnter={() => setHoveredCode(meta.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                />
              );
            })}
          </g>

          {/* LAYER 2: 17개 광역시도 지명 라벨 (모든 면적 폴리곤 위에 렌더링되므로 절대 가려지지 않음) */}
          <g id="map-labels" className="pointer-events-none">
            {sortedLocations.map((loc) => {
              const meta = LOCATION_META[loc.id];
              if (!meta) return null;

              const isSelected = selectedRegion.code === meta.code;
              const isHovered = hoveredCode === meta.code;

              return (
                <text
                  key={`label-${loc.id}`}
                  x={meta.labelX}
                  y={meta.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    paintOrder: 'stroke fill',
                    stroke: '#FAF8F5',
                    strokeWidth: isSelected ? '5px' : '4px',
                    strokeLinejoin: 'round',
                  }}
                  className={`select-none transition-all ${
                    isSelected
                      ? 'fill-[#12100E] font-black'
                      : isHovered
                      ? 'fill-[#1C1A17] font-extrabold'
                      : 'fill-[#3A3530] font-bold'
                  } ${meta.isMetropolis ? 'text-[13.5px]' : 'text-[15px]'}`}
                >
                  {meta.shortName}
                </text>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
