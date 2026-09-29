'use client';

import React, { useState } from 'react';
import { Pill, AlertCircle } from 'lucide-react';

export default function AntihistamineGuide() {
  const [selected, setSelected] = useState<'cetirizine' | 'fexofenadine' | 'loratadine'>('cetirizine');

  const meds = {
    cetirizine: {
      name: '세티리진 (지르텍 등)',
      tag: '빠르고 확실한 효과',
      onset: '복용 후 30분~1시간 내 효과 발현',
      drowsiness: '보통 (약 10~15% 경미한 나른함)',
      tip: '약간의 졸림이 올 수 있어 저녁 식후나 취침 30분 전에 복용하면 다음 날 아침 코가 편안합니다.',
    },
    fexofenadine: {
      name: '펙소페나딘 (알레그라 등)',
      tag: '낮 시간 집중 · 무졸림',
      onset: '복용 후 1시간 내 발현',
      drowsiness: '매우 적음 (가짜약 수준으로 졸음 없음)',
      tip: '운전이나 업무, 시험 공부 시 좋습니다. 과일주스와 함께 먹으면 흡수가 방해되므로 맹물과 드세요.',
    },
    loratadine: {
      name: '로라타딘 (클라리틴 등)',
      tag: '순하고 부드러운 작용',
      onset: '복용 후 1~3시간 내 서서히 발현',
      drowsiness: '적음',
      tip: '몸에 부담이 적고 하루 종일 완만하게 지속됩니다.',
    },
  };

  const current = meds[selected];

  return (
    <div className="bg-white border border-[#ECE7DE] rounded-2xl p-6 sm:p-7 space-y-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* 타이틀 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 border-b border-[#F4EFE6] pb-3.5">
        <div className="flex items-center gap-2.5">
          <Pill className="w-5 h-5 text-[#5F7556]" />
          <h3 className="text-lg sm:text-xl font-bold text-[#1F1D1A]">
            항히스타민제 복용 가이드
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#7A726A] font-medium">
          처방전 없이 약국에서 구매 가능한 대표 2세대 항히스타민제
        </p>
      </div>

      {/* 3대 성분 탭 */}
      <div className="grid grid-cols-3 gap-2.5">
        {(Object.keys(meds) as Array<keyof typeof meds>).map((key) => {
          const item = meds[key];
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-[#5F7556] bg-[#FAF8F5] text-[#1F1D1A] ring-1 ring-[#5F7556]/20'
                  : 'border-[#EDE8E0] bg-white text-[#544E47] hover:bg-[#F9F7F3]'
              }`}
            >
              <div className="text-sm sm:text-base font-bold">{item.name.split(' ')[0]}</div>
              <div className="text-xs text-[#7A726A] mt-1 font-medium truncate">{item.tag}</div>
            </button>
          );
        })}
      </div>

      {/* 선택된 성분 상세 (시원한 폰트) */}
      <div className="bg-[#FAF8F5] border border-[#EDE8E0] rounded-xl p-4 sm:p-5 text-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#1F1D1A] text-base">{current.name}</span>
          <span className="text-xs text-[#7A726A] font-medium">{current.onset}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#4A443E]">
          <div>
            <span className="text-xs font-semibold text-[#8C827A] block mb-0.5">졸림 정도</span>
            <span className="font-bold text-[#1F1D1A]">{current.drowsiness}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#8C827A] block mb-0.5">복용 요령</span>
            <span className="text-[#3A3530] leading-relaxed font-medium">{current.tip}</span>
          </div>
        </div>
      </div>

      {/* 필수 복용 상식 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EDE8E0] text-[#4A443E]">
          <span className="font-bold text-[#1F1D1A] block mb-1">외출 전 미리 복용</span>
          <p className="text-xs sm:text-sm leading-relaxed text-[#544E47]">
            꽃가루 지수가 높은 날은 증상이 심해진 뒤보다 외출 1~2시간 전에 미리 복용하는 것이 예방 효과가 훨씬 뛰어납니다.
          </p>
        </div>
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EDE8E0] text-[#4A443E]">
          <span className="font-bold text-[#1F1D1A] block mb-1">내성 걱정 적음</span>
          <p className="text-xs sm:text-sm leading-relaxed text-[#544E47]">
            먹는 2세대 항히스타민제는 비충혈 스프레이와 달리 반동성 내성 위험이 적어 시즌 중 꾸준히 드셔도 비교적 안전합니다.
          </p>
        </div>
      </div>

      {/* 의사/약사 상담 주의 문구 */}
      <div className="p-4 bg-[#FBF6F4] border border-[#EEDCD7] rounded-xl text-xs sm:text-sm text-[#8A564C] flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#A85848] shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p className="font-bold text-[#783F35]">
            의사 및 약사 상담 필수 주의사항 (의학적 면책 고지)
          </p>
          <p className="text-[#8A564C] text-xs sm:text-sm">
            본 가이드는 정보 제공용이며 전문의의 처방을 대신하지 않습니다. 
            만성 신장·간 질환자, 임산부·수유부, 전립선 비대증 환자는 복용 전 반드시 의사 또는 약사와 상담하세요. 복용 중 음주는 삼가시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
}
