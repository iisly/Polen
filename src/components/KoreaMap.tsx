'use client';

import React, { useState } from 'react';
import koreaMap from '@svg-maps/south-korea';
import { REGIONS } from '@/lib/constants';
import { Region, RiskValue } from '@/types/pollen';
import { getRiskMeta, RISK_LEVEL_META } from '@/lib/risk';
import { findClosestRegion } from '@/lib/geo';
import { Navigation } from 'lucide-react';

interface KoreaMapProps {
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  regionalRisks?: Record<string, RiskValue>;
  dayLabel?: string;
}

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
  'north-chungcheong': { code: '4300000000', shortName: '충북', labelX: 215, labelY: 205 },
  'south-chungcheong': { code: '4400000000', shortName: '충남', labelX: 130, labelY: 250 },
  sejong: { code: '3611000000', shortName: '세종', labelX: 172, labelY: 238, isMetropolis: true },
  daejeon: { code: '3000000000', shortName: '대전', labelX: 192, labelY: 275, isMetropolis: true },
  'north-gyeongsang': { code: '4700000000', shortName: '경북', labelX: 320, labelY: 235 },
  daegu: { code: '2700000000', shortName: '대구', labelX: 300, labelY: 336, isMetropolis: true },
  ulsan: { code: '3100000000', shortName: '울산', labelX: 364, labelY: 365, isMetropolis: true },
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
  dayLabel = '오늘 예보',
}: KoreaMapProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('위치 서비스를 지원하지 않는 브라우저입니다.');
      setTimeout(() => setGeoNotice(null), 3000);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const closest = findClosestRegion(pos.coords.latitude, pos.coords.longitude);
        onSelectRegion(closest);
        setIsLocating(false);
        setGeoNotice(`내 위치(${closest.name})로 변경되었습니다.`);
        setTimeout(() => setGeoNotice(null), 2500);
      },
      () => {
        setIsLocating(false);
        setGeoNotice('위치 정보를 가져올 수 없습니다.');
        setTimeout(() => setGeoNotice(null), 3000);
      },
      { timeout: 7000 }
    );
  };

  const sortedLocations = [...koreaMap.locations].sort((a, b) => {
    const metaA = LOCATION_META[a.id];
    const metaB = LOCATION_META[b.id];
    if (metaA?.code === selectedRegion.code) return 1;
    if (metaB?.code === selectedRegion.code) return -1;
    return 0;
  });

  return (
    <div className="bg-white border border-[#ECE7DE] rounded-2xl p-3 sm:p-5 flex flex-col justify-between h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative min-h-[440px] sm:min-h-[490px]">
      {/* 🧭 우측 상단 플로팅 컨트롤: 내 위치 + 지역 선택 드롭다운 */}
      <div className="absolute top-3.5 right-3.5 z-20 flex flex-col items-end gap-1.5">
        <button
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-[#E0D9CD] hover:bg-white hover:border-[#BCB3A4] active:scale-95 rounded-xl text-[#3A3530] shadow-xs transition text-xs font-bold cursor-pointer"
          title="GPS로 내 위치 찾기"
          aria-label="GPS로 내 위치 찾기"
        >
          <Navigation className={`w-3.5 h-3.5 text-[#5F7556] ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? '위치 탐색 중' : '내 위치'}</span>
        </button>

        {/* 지역 선택 플로팅 셀렉트 (모바일/PC 공통) */}
        <div className="relative">
          <select
            id="region-select"
            value={selectedRegion.code}
            onChange={(e) => {
              const found = REGIONS.find((r) => r.code === e.target.value);
              if (found) onSelectRegion(found);
            }}
            aria-label="지역 선택"
            className="text-xs pl-2.5 pr-7 py-1.5 rounded-xl border border-[#E0D9CD] bg-white/95 backdrop-blur-md text-[#3A3530] font-bold shadow-xs hover:border-[#BCB3A4] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#5F7556]"
          >
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {geoNotice && (
          <span className="text-[11px] font-semibold text-[#5F7556] bg-white/95 px-2 py-1 rounded-md border border-[#E0D9CD] shadow-xs animate-in fade-in">
            {geoNotice}
          </span>
        )}
      </div>

      {/* 대한민국 17개 광역시·도 벡터 지도 */}
      <div className="w-full flex-1 flex items-center justify-center relative my-auto py-2 sm:py-3 px-1 sm:px-2">
        <svg
          viewBox="-20 -15 565 660"
          className="w-full h-full max-h-[510px] select-none overflow-visible"
          role="region"
          aria-label="대한민국 시·도별 꽃가루 위험도 지도"
        >
          {/* LAYER 1: 시·도 폴리곤 */}
          <g id="map-polygons">
            {sortedLocations.map((loc) => {
              const meta = LOCATION_META[loc.id];
              if (!meta) return null;

              const isSelected = selectedRegion.code === meta.code;
              const isHovered = hoveredCode === meta.code;
              const riskVal = regionalRisks[meta.code] ?? null;
              const riskMeta = getRiskMeta(riskVal);

              return (
                <path
                  key={loc.id}
                  id={loc.id}
                  d={loc.path}
                  fill={riskMeta.fillColor}
                  stroke={isSelected ? '#24201C' : isHovered ? '#6B6357' : riskMeta.strokeColor}
                  strokeWidth={isSelected ? 3.2 : isHovered ? 2 : 1}
                  strokeLinejoin="round"
                  tabIndex={0}
                  role="button"
                  aria-label={`${meta.shortName}: ${riskMeta.title} (${riskVal !== null ? `${riskVal}단계` : '미수신'})`}
                  className="cursor-pointer transition-colors duration-150 outline-none focus:stroke-[#24201C] focus:stroke-2"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 3px 8px rgba(36,32,28,0.35))' : undefined,
                  }}
                  onClick={() => {
                    const found = REGIONS.find((r) => r.code === meta.code);
                    if (found) onSelectRegion(found);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const found = REGIONS.find((r) => r.code === meta.code);
                      if (found) onSelectRegion(found);
                    }
                  }}
                  onMouseEnter={() => setHoveredCode(meta.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                />
              );
            })}
          </g>

          {/* LAYER 2: 지명 라벨 */}
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

      {/* 🎨 우측 하단 위험도 범례 (단계 + 결측값 식별) */}
      <div className="absolute bottom-3.5 right-3.5 z-20 flex flex-col gap-1 sm:gap-1.5 px-2.5 py-2 bg-white/95 backdrop-blur-md border border-[#E0D9CD] rounded-xl shadow-xs text-[10px] sm:text-[11px] text-[#544E47] font-bold">
        <span className="text-[10px] text-[#5F7556] font-extrabold pb-1 border-b border-[#EAE5DC] block text-center">
          {dayLabel}
        </span>
        {Object.values(RISK_LEVEL_META).map((m) => (
          <div key={m.level} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-xs shrink-0"
              style={{ backgroundColor: m.fillColor, border: `1px solid ${m.strokeColor}` }}
            />
            <span>{m.level} {m.title}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 border-t border-[#F0ECE4] pt-1 mt-0.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#E8E3DA] border border-[#C8BFB2] shrink-0" />
          <span className="text-[#8C827A]">정보 없음</span>
        </div>
      </div>
    </div>
  );
}
