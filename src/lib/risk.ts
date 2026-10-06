import { RiskValue } from '@/types/pollen';

export interface RiskMeta {
  level: RiskValue;
  title: string;
  sub: string;
  badgeClass: string;
  dotColor: string;
  fillColor: string;
  strokeColor: string;
}

export const RISK_LEVEL_META: Record<number, Omit<RiskMeta, 'level'> & { level: number }> = {
  0: {
    level: 0,
    title: '낮음',
    sub: '꽃가루 알레르기가 심한 환자는 증상이 나타날 수 있습니다.',
    badgeClass: 'bg-[#EFF5EC] text-[#406838] border-[#CCE2C4]',
    dotColor: 'bg-[#5F7556]',
    fillColor: '#EDE8DF', // 웜 베이지
    strokeColor: '#B8AFA0',
  },
  1: {
    level: 1,
    title: '보통',
    sub: '꽃가루 알레르기가 약한 환자도 증상이 나타날 수 있으므로 야외 활동 시 마스크, 선글라스를 착용하세요.',
    badgeClass: 'bg-[#FAF4E5] text-[#8C6D23] border-[#EFE0B8]',
    dotColor: 'bg-[#BFA15F]',
    fillColor: '#E5D3A6', // 웜 골드/옐로우
    strokeColor: '#D5C293',
  },
  2: {
    level: 2,
    title: '높음',
    sub: '대개의 환자에게서 증상이 나타날 수 있으므로 가급적 야외 활동을 자제하고 외출 후 샤워를 권장합니다.',
    badgeClass: 'bg-[#FDF0EC] text-[#B85438] border-[#F7D2C4]',
    dotColor: 'bg-[#C28C7E]',
    fillColor: '#DF9F86', // 코랄/테라코타
    strokeColor: '#CF8E75',
  },
  3: {
    level: 3,
    title: '매우높음',
    sub: '거의 모든 환자에게 증상이 나타날 수 있으므로 외출을 자제하고 창문을 닫으세요. 증상 심화 시 전문의를 방문하세요.',
    badgeClass: 'bg-[#FBE8E5] text-[#9E3622] border-[#F2C5BD]',
    dotColor: 'bg-[#A85848]',
    fillColor: '#C86350', // 로즈 레드
    strokeColor: '#B75340',
  },
};

export const NO_DATA_META: RiskMeta = {
  level: null,
  title: '데이터 없음',
  sub: '현재 관측 데이터가 없거나 수신되지 않았습니다.',
  badgeClass: 'bg-[#F0ECE4] text-[#7A726A] border-[#DCD5CB]',
  dotColor: 'bg-[#9E958C]',
  fillColor: '#E8E3DA',
  strokeColor: '#C8BFB2',
};

export function getRiskMeta(risk: RiskValue): RiskMeta {
  if (risk === null || !(risk in RISK_LEVEL_META)) {
    return NO_DATA_META;
  }
  return { ...RISK_LEVEL_META[risk], level: risk };
}
