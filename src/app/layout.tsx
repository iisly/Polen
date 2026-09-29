import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Polen - 꽃가루 알레르기 케어',
  description:
    '기상청 꽃가루농도위험지수 조회서비스(3.0) 기반 실시간 꽃가루 위험도 및 계절성 알레르기·비염 환자 케어',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
