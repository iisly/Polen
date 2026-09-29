'use client';

import React, { useState } from 'react';
import { REGIONS } from '@/lib/constants';
import { Region } from '@/types/pollen';
import { Navigation } from 'lucide-react';

interface KoreaMapProps {
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
}

interface MapNode {
  code: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
}

const MAP_NODES: MapNode[] = [
  { code: '1100000000', name: '서울특별시', shortName: '서울', x: 105, y: 85 },
  { code: '2800000000', name: '인천광역시', shortName: '인천', x: 70, y: 92 },
  { code: '4100000000', name: '경기도', shortName: '경기', x: 125, y: 118 },
  { code: '4200000000', name: '강원특별자치도', shortName: '강원', x: 195, y: 70 },
  { code: '3611000000', name: '세종특별자치시', shortName: '세종', x: 118, y: 162 },
  { code: '3000000000', name: '대전광역시', shortName: '대전', x: 128, y: 185 },
  { code: '4300000000', name: '충청북도', shortName: '충북', x: 168, y: 145 },
  { code: '4400000000', name: '충청남도', shortName: '충남', x: 75, y: 175 },
  { code: '4500000000', name: '전북특별자치도', shortName: '전북', x: 105, y: 232 },
  { code: '2900000000', name: '광주광역시', shortName: '광주', x: 96, y: 272 },
  { code: '4600000000', name: '전라남도', shortName: '전남', x: 86, y: 308 },
  { code: '2700000000', name: '대구광역시', shortName: '대구', x: 208, y: 212 },
  { code: '4700000000', name: '경상북도', shortName: '경북', x: 222, y: 162 },
  { code: '4800000000', name: '경상남도', shortName: '경남', x: 180, y: 272 },
  { code: '3100000000', name: '울산광역시', shortName: '울산', x: 252, y: 245 },
  { code: '2600000000', name: '부산광역시', shortName: '부산', x: 235, y: 282 },
  { code: '5000000000', name: '제주특별자치도', shortName: '제주', x: 92, y: 348 },
];

export default function KoreaMap({
  selectedRegion,
  onSelectRegion,
}: KoreaMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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
    <div className="bg-white border border-[#ECE7DE] rounded-2xl p-5 sm:p-6 flex flex-col justify-between h-full shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* 컴팩트 헤더 */}
      <div className="flex items-center justify-between border-b border-[#F4EFE6] pb-3 mb-2">
        <span className="font-bold text-[#2D2A26] text-sm sm:text-base">
          지역 선택
        </span>
        <button
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-[#E5DFD4] hover:bg-[#F2ECE1] rounded-lg text-[#4A443E] transition text-xs font-medium"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? '확인 중' : '내 위치'}</span>
        </button>
      </div>

      {/* 아담하고 컴팩트한 SVG 지도 */}
      <div className="w-full max-w-[270px] aspect-[3/4] relative mx-auto my-auto">
        <svg
          viewBox="0 0 300 375"
          className="w-full h-full select-none"
        >
          {/* 한반도 컴팩트 실루엣 */}
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
            fill="#F7F4EE"
            stroke="#E8E2D6"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* 제주도 */}
          <ellipse
            cx="92"
            cy="348"
            rx="24"
            ry="12"
            fill="#F7F4EE"
            stroke="#E8E2D6"
            strokeWidth="1.5"
          />

          {/* 울릉도 & 독도: 아까처럼 심플하게 점만 콕콕 */}
          <circle cx="258" cy="110" r="3.2" fill="#DCD5CB" stroke="#C9C1B4" strokeWidth="0.8" />
          <circle cx="274" cy="116" r="2" fill="#DCD5CB" stroke="#C9C1B4" strokeWidth="0.8" />

          {/* 17개 핀 및 선명한 라벨 */}
          {MAP_NODES.map((node) => {
            const isSelected = selectedRegion.code === node.code;
            const isHovered = hoveredNode === node.code;

            return (
              <g
                key={node.code}
                className="cursor-pointer transition-transform"
                onClick={() => {
                  const found = REGIONS.find((r) => r.code === node.code);
                  if (found) onSelectRegion(found);
                }}
                onMouseEnter={() => setHoveredNode(node.code)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="14"
                    fill="#5F7556"
                    opacity="0.22"
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 9 : isHovered ? 8 : 6.5}
                  fill={isSelected ? '#5F7556' : isHovered ? '#B5ACA0' : '#FFFFFF'}
                  stroke={isSelected ? '#485941' : '#B8AFA3'}
                  strokeWidth="1.5"
                />

                <text
                  x={node.x}
                  y={node.y + (node.code === '5000000000' ? 16 : node.code === '1100000000' ? -13 : 15)}
                  textAnchor="middle"
                  className={`text-[11.5px] select-none ${
                    isSelected
                      ? 'fill-[#1F1D1A] font-extrabold text-[12px]'
                      : isHovered
                      ? 'fill-[#1F1D1A] font-bold'
                      : 'fill-[#544E47] font-semibold'
                  }`}
                >
                  {node.shortName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
