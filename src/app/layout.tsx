import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'https://polen-nu.vercel.app';
};

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Polen - 꽃가루 알레르기 케어',
  description:
    '기상청 꽃가루농도위험지수 조회서비스(3.0) 기반 실시간 전국 꽃가루 위험도 예보, 단계별 공식 대응요령 및 2세대 항히스타민제 복용 가이드',
  keywords: [
    '꽃가루',
    '꽃가루농도위험지수',
    '송화가루',
    '참나무꽃가루',
    '잡초류꽃가루',
    '알레르기비염',
    '꽃가루예보',
    '기상청꽃가루',
    '비염약',
    '항히스타민제',
    '세티리진',
    '지르텍',
    '로라타딘',
    '클라리틴',
    '펙소페나딘',
    '알레그라',
    '알레르기예보',
  ],
  authors: [{ name: 'Polen' }],
  creator: 'Polen',
  publisher: 'Polen',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Polen - 꽃가루 알레르기 케어',
    description:
      '기상청 꽃가루농도위험지수 조회서비스(3.0) 기반 실시간 전국 꽃가루 위험도 예보, 단계별 공식 대응요령 및 항히스타민제 가이드',
    url: siteUrl,
    siteName: 'Polen',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Polen - 꽃가루 알레르기 케어',
    description:
      '기상청 꽃가루농도위험지수 조회서비스(3.0) 기반 실시간 전국 꽃가루 위험도 예보, 단계별 공식 대응요령 및 항히스타민제 가이드',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      '0ppTEUKGqQFTTxb9uV6PV3uzYP2XzVTBtZdw7WKWtBs',
    other: {
      'naver-site-verification':
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ||
        'ab3f5e0eb58061a5a02146fb5aafbbe171fb56a0',
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Polen - 꽃가루 알레르기 케어',
  url: siteUrl,
  description:
    '기상청 꽃가루농도위험지수 조회서비스(3.0) 기반 실시간 전국 꽃가루 위험도 예보, 단계별 공식 대응요령 및 2세대 항히스타민제 복용 가이드',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
