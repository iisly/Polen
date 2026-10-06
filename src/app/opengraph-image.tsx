import { ImageResponse } from 'next/og';

export const alt = 'Polen - 꽃가루 알레르기 케어';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          backgroundColor: '#FAF8F5',
          backgroundImage: 'radial-gradient(#E8E2D7 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          color: '#1F1D1A',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 상단 뱃지 및 브랜드 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#5F7556',
              color: '#FFFFFF',
              padding: '10px 22px',
              borderRadius: '9999px',
              fontSize: '22px',
              fontWeight: 700,
            }}
          >
            <span>🌿</span>
            <span>기상청 3.0 공식 연동</span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              fontSize: '18px',
              color: '#7A726A',
              fontWeight: 600,
            }}
          >
            <span>참나무</span>
            <span>•</span>
            <span>소나무</span>
            <span>•</span>
            <span>잡초류</span>
          </div>
        </div>

        {/* 중앙 메인 타이틀 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1
            style={{
              fontSize: '66px',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              margin: 0,
              color: '#1F1D1A',
              lineHeight: 1.15,
            }}
          >
            Polen - 꽃가루 알레르기 케어
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#635C54',
              margin: 0,
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            실시간 전국 꽃가루 위험지수 예보와 단계별 대응요령 & 항히스타민제 가이드
          </p>
        </div>

        {/* 하단 4단계 지수 뱃지 시각화 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '28px',
            borderTop: '2px solid #EAE5DC',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#EFF5EC',
                color: '#406838',
                padding: '8px 18px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 700,
                border: '1px solid #CCE2C4',
              }}
            >
              0 낮음
            </div>
            <div
              style={{
                backgroundColor: '#FAF4E5',
                color: '#8C6D23',
                padding: '8px 18px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 700,
                border: '1px solid #EFE0B8',
              }}
            >
              1 보통
            </div>
            <div
              style={{
                backgroundColor: '#FDF0EC',
                color: '#B85438',
                padding: '8px 18px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 700,
                border: '1px solid #F7D2C4',
              }}
            >
              2 높음
            </div>
            <div
              style={{
                backgroundColor: '#FBE8E5',
                color: '#9E3622',
                padding: '8px 18px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 700,
                border: '1px solid #F2C5BD',
              }}
            >
              3 매우높음
            </div>
          </div>

          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#8C827A',
            }}
          >
            polen-nu.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
