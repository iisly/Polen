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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#5F7556',
          borderRadius: '7px',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="26"
          height="26"
          fill="none"
        >
          <path
            d="M16 4C16 4 8 10 8 18C8 22.4183 11.5817 26 16 26C20.4183 26 24 22.4183 24 18C24 10 16 4 16 4Z"
            fill="#FAF8F5"
          />
          <path
            d="M16 11V25"
            stroke="#5F7556"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="23" cy="8" r="3.2" fill="#E8B86D" stroke="#FAF8F5" strokeWidth="1.2" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
