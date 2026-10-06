'use client';

import React, { useState, useTransition } from 'react';
import Header from '@/components/Header';
import KoreaMap from '@/components/KoreaMap';
import PollenSummaryCard from '@/components/PollenSummaryCard';
import AntihistamineGuide from '@/components/AntihistamineGuide';
import PollenCalendar from '@/components/PollenCalendar';
import { REGIONS } from '@/lib/constants';
import { Region, PollenSnapshot, RiskValue } from '@/types/pollen';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PollenDashboardProps {
  initialSnapshot: PollenSnapshot;
}

export default function PollenDashboard({ initialSnapshot }: PollenDashboardProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<PollenSnapshot>(initialSnapshot);
  const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = async () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/pollen', { cache: 'no-store' });
        if (res.ok) {
          const fresh: PollenSnapshot = await res.json();
          setSnapshot(fresh);
        }
      } catch (err) {
        console.error('Refresh error:', err);
      }
      router.refresh();
    });
  };

  const days = snapshot.days;
  const currentDayInfo = days[selectedDayIndex] || days[0];

  // 선택된 날짜에 대한 전국 17개 시·도 위험도 맵 생성
  const regionalRisks: Record<string, RiskValue> = {};
  for (const reg of REGIONS) {
    const regForecast = snapshot.regions[reg.code];
    regionalRisks[reg.code] = regForecast?.overall[selectedDayIndex] ?? null;
  }

  const selectedRegionForecast = snapshot.regions[selectedRegion.code];
  const isConnected = snapshot.status === 'ok' || snapshot.status === 'partial';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2A26] flex flex-col font-sans selection:bg-[#EAE4D9]">
      {/* 헤더 */}
      <Header
        isLiveConnected={isConnected}
        forecastDate={snapshot.announcement?.label ?? '미발표'}
        onRefresh={handleRefresh}
        isLoading={isPending}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 상태 안내 배너 */}
        {snapshot.status !== 'ok' && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#F6F1EC] border border-[#E9DFD7] text-xs text-[#7A6158]">
            <AlertCircle className="w-4 h-4 text-[#A85848] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-[#5A453F]">
                {snapshot.status === 'off-season'
                  ? '안내:'
                  : snapshot.status === 'no-key'
                  ? '설정 필요:'
                  : snapshot.status === 'partial'
                  ? '일부 지점 결측 안내:'
                  : '데이터 수신 지연:'}
              </span>{' '}
              {snapshot.message}
            </div>
          </div>
        )}

        {/* 1. 상단: 지도(좌) + 실시간 지수(우) 6:6 분할 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* 좌측: 대형 한국 지도 보드 */}
          <div className="md:col-span-6 flex flex-col">
            <KoreaMap
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              regionalRisks={regionalRisks}
              dayLabel={`${currentDayInfo?.label ?? '오늘'} 예보`}
            />
          </div>

          {/* 우측: 선택 지역 종합 위험도 & 3대 수종 현황 */}
          <div className="md:col-span-6 flex flex-col">
            <PollenSummaryCard
              region={selectedRegion}
              forecastDate={snapshot.announcement?.label ?? '예보 준비 중'}
              days={days}
              selectedDayIndex={selectedDayIndex}
              onSelectDayIndex={setSelectedDayIndex}
              regionForecast={selectedRegionForecast}
            />
          </div>
        </div>

        {/* 2. 항히스타민제 복용 가이드 보드 */}
        <AntihistamineGuide />

        {/* 3. 연간 12개월 꽃가루 달력 */}
        <PollenCalendar currentMonth={snapshot.month} />
      </main>

      {/* 미니멀 푸터 */}
      <footer className="border-t border-[#ECE7DE] py-6 text-center text-xs text-[#9E958C]">
        <p>출처: 공공데이터포털 기상청_꽃가루농도위험지수 조회서비스(3.0)</p>
      </footer>
    </div>
  );
}
