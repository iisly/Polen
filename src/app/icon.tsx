import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#F2ECE1',
          borderRadius: '8px',
          border: '1px solid #DDD5C7',
          padding: '6px',
        }}
      >
        {/* 좌측 상단 초록 점 */}
        <div
          style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            backgroundColor: '#5F7556',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
