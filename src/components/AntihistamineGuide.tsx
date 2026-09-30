'use client';

import React, { useState } from 'react';
import { Pill, AlertCircle, ShieldAlert, HeartPulse } from 'lucide-react';

export default function AntihistamineGuide() {
  const [selected, setSelected] = useState<'cetirizine' | 'loratadine' | 'fexofenadine'>('cetirizine');

  const meds = {
    cetirizine: {
      name: '세티리진',
      brand: '지르텍 · 쎄르텍 등',
      tag: '빠르고 확실한 증상 억제',
      badge: '저녁/취침 전 복용 권장',
      onset: '복용 후 30분~1시간 내 효과 발현',
      drowsiness: '보통 (약 10~14% 경미한 졸림/나른함)',
      duration: '약 24시간 지속',
      sideEffects: [
        '진정/졸음 (운전, 정밀 기계 조작, 집중이 필요한 업무 시 주의)',
        '구강건조 (입안이 마르고 갈증이 느껴질 수 있음)',
        '피로감 및 경미한 두통',
      ],
      cautions: [
        '신장(콩팥)으로 주로 배설되므로 신기능 저하 환자는 복용량 감량 필요',
        '복용 중 음주는 중추신경 억제 및 졸음을 크게 증폭시키므로 금주',
      ],
      tip: '약간의 졸림이 동반될 수 있어 저녁 식후나 취침 30분 전에 복용하면 수면 중 코막힘을 예방하고 다음 날 아침이 상쾌합니다.',
    },
    loratadine: {
      name: '로라타딘',
      brand: '클라리틴 · 플로라딘 등',
      tag: '순하고 부드러운 작용',
      badge: '하루 종일 편안한 지속형',
      onset: '복용 후 1~3시간 내 서서히 발현',
      drowsiness: '적음 (약 2~4% 내외로 경미)',
      duration: '약 24시간 균일 지속',
      sideEffects: [
        '드물게 두통 또는 피로감',
        '경미한 입마름, 위장 장애',
        '심한 졸음은 드물게 보고됨',
      ],
      cautions: [
        '간에서 주로 대사되므로 중증 간기능 장애 환자는 격일 복용 또는 감량 상담 권장',
        '알레르기 피부 반응 검사 전에는 최소 48시간 전 복용 중단 필요',
      ],
      tip: '작용이 부드럽고 몸에 부담이 적어 만성 비염 환자나 알레르기 약을 처음 드시는 분들에게 선호도가 높습니다.',
    },
    fexofenadine: {
      name: '펙소페나딘',
      brand: '알레그라 · 펙소나딘 등',
      tag: '낮 시간 집중 · 졸음 걱정 제로',
      badge: '수험생 · 직장인 1순위',
      onset: '복용 후 1시간 내 효과 발현',
      drowsiness: '매우 적음 (가짜약/위약 수준으로 졸음 없음)',
      duration: '약 12~24시간 지속 (120mg/180mg)',
      sideEffects: [
        '경미한 두통 또는 어지러움',
        '소화불량, 메스꺼움 등 가벼운 위장관 불편감',
        '졸음 부작용은 현존 항히스타민제 중 가장 낮음',
      ],
      cautions: [
        '과일주스(자몽·오렌지·사과)와 함께 복용 시 장내 흡수율이 50% 이상 급감하므로 반드시 미온수(맹물)와 복용',
        '제산제(알루미늄·마그네슘 함유) 복용 시 약 2시간 이상 간격 유지',
      ],
      tip: '뇌혈관장벽(BBB)을 거의 통과하지 않아 운전, 중요한 시험, 외근 시 안심하고 복용할 수 있는 대표 낮 복용 약제입니다.',
    },
  };

  const current = meds[selected];

  return (
    <div className="bg-white border border-[#ECE7DE] rounded-2xl p-5 sm:p-7 space-y-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* 타이틀 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-[#F4EFE6] pb-3.5">
        <div className="flex items-center gap-2.5">
          <Pill className="w-5 h-5 text-[#5F7556]" />
          <h3 className="text-lg sm:text-xl font-bold text-[#1F1D1A]">
            항히스타민제 복용 가이드
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#7A726A] font-medium">
          처방전 없이 약국에서 구매 가능한 대표 2세대 성분 비교
        </p>
      </div>

      {/* 3대 성분 탭 (플러딩/줄바꿈 방지) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {(Object.keys(meds) as Array<keyof typeof meds>).map((key) => {
          const item = meds[key];
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`p-2.5 sm:p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? 'border-[#5F7556] bg-[#FAF8F5] text-[#1F1D1A] ring-1 ring-[#5F7556]/20 shadow-xs'
                  : 'border-[#EDE8E0] bg-white text-[#544E47] hover:bg-[#F9F7F3]'
              }`}
            >
              <div className="w-full text-center">
                <span className="text-xs sm:text-sm font-extrabold block text-[#1F1D1A] whitespace-nowrap text-center">
                  {item.name}
                </span>
                <span className="text-[11px] sm:text-xs text-[#7A726A] block mt-0.5 whitespace-nowrap text-center">
                  {item.brand.split(' ')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택된 성분 상세 정보 */}
      <div className="bg-[#FAF8F5] border border-[#EDE8E0] rounded-xl p-4 sm:p-5 space-y-4">
        {/* 헤더 정보 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#EAE5DC] pb-3">
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-[#1F1D1A] text-base sm:text-lg">
              {current.name}
            </span>
            <span className="text-xs text-[#7A726A] font-semibold">
              ({current.brand})
            </span>
          </div>
          <span className="text-xs font-bold text-[#5F7556] bg-[#EDEFEA] px-2.5 py-1 rounded-full self-start sm:self-auto">
            {current.tag}
          </span>
        </div>

        {/* 발현 시간 및 졸림 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#4A443E]">
          <div className="p-3 bg-white rounded-lg border border-[#EAE5DC]">
            <span className="font-bold text-[#8C827A] block mb-1">효과 발현 및 지속</span>
            <span className="font-extrabold text-[#1F1D1A] block">{current.onset}</span>
            <span className="text-xs text-[#7A726A] mt-0.5 block">{current.duration}</span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-[#EAE5DC]">
            <span className="font-bold text-[#8C827A] block mb-1">졸림 정도</span>
            <span className="font-extrabold text-[#1F1D1A] block">{current.drowsiness}</span>
            <span className="text-xs text-[#7A726A] mt-0.5 block">{current.badge}</span>
          </div>
        </div>

        {/* 부작용 상세 안내 ⭐ (유저 요청 반영) */}
        <div className="p-3.5 bg-[#FFF9F7] rounded-xl border border-[#F2DDD7] space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#A85848]">
            <ShieldAlert className="w-4 h-4 text-[#A85848] shrink-0" />
            <span>{current.name} 주요 부작용 및 주의사항</span>
          </div>
          <ul className="text-xs sm:text-sm text-[#6E4238] space-y-1.5 pl-5 list-disc leading-relaxed font-medium">
            {current.sideEffects.map((effect, idx) => (
              <li key={idx}>{effect}</li>
            ))}
            {current.cautions.map((caution, idx) => (
              <li key={`c-${idx}`} className="font-semibold text-[#8A3626]">{caution}</li>
            ))}
          </ul>
        </div>

        {/* 복용 팁 */}
        <div className="text-xs sm:text-sm text-[#4A443E] bg-white p-3 rounded-lg border border-[#EAE5DC] leading-relaxed">
          <span className="font-bold text-[#1F1D1A] mr-1.5">💡 복용 팁:</span>
          {current.tip}
        </div>
      </div>

      {/* 필수 복용 상식 2열 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EDE8E0] text-[#4A443E]">
          <div className="flex items-center gap-2 mb-1.5">
            <HeartPulse className="w-4 h-4 text-[#5F7556]" />
            <span className="font-bold text-[#1F1D1A]">외출 1~2시간 전 미리 복용</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-[#544E47]">
            히스타민이 체내 수용체에 결합한 후에는 약효가 떨어집니다. 꽃가루 지수가 높은 날은 증상이 터지기 전에 미리 드시는 것이 좋습니다.
          </p>
        </div>
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EDE8E0] text-[#4A443E]">
          <div className="flex items-center gap-2 mb-1.5">
            <Pill className="w-4 h-4 text-[#5F7556]" />
            <span className="font-bold text-[#1F1D1A]">반동성 내성 걱정 적음</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-[#544E47]">
            먹는 2세대 항히스타민제는 비충혈 완화 스프레이(오트리빈 등)와 달리 혈관 반동성 비염을 일으키지 않아 시즌 중 꾸준히 드셔도 비교적 안전합니다.
          </p>
        </div>
      </div>

      {/* 의사/약사 상담 주의 문구 */}
      <div className="p-4 bg-[#FBF6F4] border border-[#EEDCD7] rounded-xl text-xs sm:text-sm text-[#8A564C] flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#A85848] shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p className="font-bold text-[#783F35]">
            의사 및 약사 상담 필수
          </p>
          <p className="text-[#8A564C] text-xs sm:text-sm">
            본 가이드는 건강정보 제공용이며 전문의의 진단과 처방을 대신하지 않습니다. 
            만성 신장·간 질환자, 임산부·수유부, 고령자 및 다른 약물을 정기 복용 중인 분은 복용 전 의사 또는 약사와 상담하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
