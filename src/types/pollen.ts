export type PollenType = 'oak' | 'pine' | 'weeds';

export type RiskLevel = 0 | 1 | 2 | 3;

export interface RiskLevelInfo {
  level: RiskLevel;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  textColor: string;
  shortDesc: string;
  patientAction: string;
}

export interface PollenForecastItem {
  type: PollenType;
  name: string;
  season: string;
  isActiveSeason: boolean;
  today: RiskLevel;
  tomorrow: RiskLevel;
  dayAfterTomorrow: RiskLevel;
  twoDaysAfterTomorrow?: RiskLevel;
  dateStr?: string;
}

export interface Region {
  code: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
}

export interface RegionalDailyRisks {
  today: Record<string, RiskLevel>;
  tomorrow: Record<string, RiskLevel>;
  dayAfterTomorrow: Record<string, RiskLevel>;
}

export interface PollenApiResponse {
  success: boolean;
  isOffSeason: boolean;
  error?: string;
  region: Region;
  forecastDate: string;
  items: Record<PollenType, PollenForecastItem>;
  maxTodayRisk: RiskLevel;
  message?: string;
  regionalRisks?: Record<string, RiskLevel>;
  regionalDailyRisks?: RegionalDailyRisks;
}

export interface PatientTip {
  category: 'rhinitis' | 'asthma' | 'conjunctivitis' | 'dermatitis';
  categoryName: string;
  iconName: string;
  title: string;
  tips: string[];
}
