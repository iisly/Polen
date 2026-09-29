'use client';

import React, { useState, useEffect } from 'react';
import { X, KeyRound, ExternalLink, Check, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  currentKey: string;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  onSaveKey,
  currentKey,
}: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKeyInput(currentKey);
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    onSaveKey('');
    setKeyInput('');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm">
      <div className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-2xl max-w-md w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#8C827A] hover:text-[#2D2A26] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="w-4 h-4 text-[#7D8F76]" />
          <h3 className="text-sm font-semibold text-[#2D2A26]">
            기상청 API 키 설정
          </h3>
        </div>

        <p className="text-xs text-[#6F6760] mb-4 leading-relaxed">
          공공데이터포털(data.go.kr)의 [기상청_꽃가루농도위험지수 조회서비스(3.0)] 일반 인증키를 입력하면 실시간으로 연동됩니다.
        </p>

        <input
          type="text"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="인증키를 붙여넣으세요"
          className="w-full text-xs px-3 py-2.5 rounded-lg border border-[#DCD5CB] bg-white text-[#2D2A26] focus:outline-none focus:border-[#8C827A] font-mono mb-4"
        />

        <div className="flex items-center justify-between">
          {currentKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-[#A85848] hover:underline"
            >
              키 초기화
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#6F6760] hover:text-[#2D2A26]"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#2D2A26] hover:bg-[#443F3A] text-white rounded-lg transition"
            >
              {saved ? '저장됨' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
