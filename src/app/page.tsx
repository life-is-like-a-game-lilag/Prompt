'use client';

import { useState, useEffect } from 'react';
import ThemeToggle from './components/ThemeToggle';
import { useAccessibility } from './components/AccessibilityProvider';

interface Prompt {
  id: number;
  title: string;
  description: string;
  prompt: string;
  role: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 접근성 훅
  const { announce } = useAccessibility();

  return (
    <div className="min-h-screen dark-bg light-bg transition-all duration-500">
      {/* 테마 토글 버튼 */}
      <aside className="fixed top-4 right-4 z-50" aria-label="테마 설정">
        <ThemeToggle />
      </aside>
      
      <main className="container mx-auto px-4 py-6 max-w-6xl" role="main" aria-label="메인 콘텐츠">
        {/* Hero 섹션 */}
        <header className="text-center mb-12 animate-fade-in" role="banner">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 leading-tight">
            ✨ 프롬프트 작성기
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl theme-text-secondary mb-6 max-w-3xl mx-auto leading-relaxed">
            🤖 AI와 함께하는 스마트한 프롬프트 작성
          </p>
        </header>
        
        {/* 기본 메시지 */}
        <div className="text-center theme-text-secondary">
          <p>프롬프트 관리 시스템을 구축 중입니다...</p>
        </div>
      </main>
    </div>
  );
}
