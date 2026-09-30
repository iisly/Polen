'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import KoreaMap from '@/components/KoreaMap';
import PollenSummaryCard from '@/components/PollenSummaryCard';
import AntihistamineGuide from '@/components/AntihistamineGuide';
import PollenCalendar from '@/components/PollenCalendar';
import ApiKeyModal from '@/components/ApiKeyModal';
import { REGIONS } from '@/lib/constants';
import { Region, PollenApiResponse } from '@/types/pollen';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(REGIONS[0]);
  const [pollenData, setPollenData] = useState<PollenApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kma_pollen_api_key');
      if (saved) setUserApiKey(saved);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchPollenData = useCallback(async (region: Region, apiKey: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ areaNo: region.code });
      if (apiKey) params.append('apiKey', apiKey);

      const res = await fetch(`/api/pollen?${params.toString()}`);
      const data: PollenApiResponse = await res.json();
      setPollenData(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPollenData(selectedRegion, userApiKey);
  }, [selectedRegion, userApiKey, fetchPollenData]);

  const handleSaveApiKey = (newKey: string) => {
    setUserApiKey(newKey);
    try {
      if (newKey) {
        localStorage.setItem('kma_pollen_api_key', newKey);
      } else {
        localStorage.removeItem('kma_pollen_api_key');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2A26] flex flex-col font-sans selection:bg-[#EAE4D9]">
      {/* 헤더 */}
      <Header
        isLiveConnected={pollenData?.success ?? false}
        forecastDate={pollenData?.forecastDate ?? '확인 중'}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onRefresh={() => fetchPollenData(selectedRegion, userApiKey)}
        isLoading={isLoading}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 기상청 데이터 미수신 시 은은하고 솔직한 안내 */}
        {!pollenData?.success && pollenData?.error && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#F6F1EC] border border-[#E9DFD7] text-xs text-[#7A6158]">
            <AlertCircle className="w-4 h-4 text-[#A85848] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-[#5A453F]">기상청 데이터를 불러오지 못했습니다.</span>{' '}
              {pollenData.error} (비산기 및 데이터 부재로 위험지수는 0으로 표출됩니다.)
            </div>
          </div>
        )}

        {/* 1. 상단: 지도(좌) + 실시간 지수(우) 균형 잡힌 6:6 분할 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* 좌측: 대형 한국 지도 보드 */}
          <div className="md:col-span-6 flex flex-col">
            <KoreaMap
              selectedRegion={selectedRegion}
              onSelectRegion={(reg) => setSelectedRegion(reg)}
              regionalRisks={{
                ...(pollenData?.regionalRisks || {}),
                ...(pollenData ? { [selectedRegion.code]: pollenData.maxTodayRisk } : {}),
              }}
            />
          </div>

          {/* 우측: 선택 지역 종합 위험도 & 3대 수종 현황 */}
          <div className="md:col-span-6 flex flex-col">
            {pollenData && (
              <PollenSummaryCard
                maxTodayRisk={pollenData.maxTodayRisk}
                items={pollenData.items}
                region={pollenData.region}
                forecastDate={pollenData.forecastDate}
              />
            )}
          </div>
        </div>

        {/* 2. 항히스타민제 복용 가이드 보드 */}
        <AntihistamineGuide />

        {/* 3. 연간 12개월 꽃가루 달력 */}
        <PollenCalendar />
      </main>

      {/* 미니멀 푸터 */}
      <footer className="border-t border-[#ECE7DE] py-6 text-center text-xs text-[#9E958C]">
        <p>출처: 공공데이터포털 기상청_꽃가루농도위험지수 조회서비스(3.0)</p>
      </footer>

      {/* API 키 모달 */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveKey={handleSaveApiKey}
        currentKey={userApiKey}
      />
    </div>
  );
}
