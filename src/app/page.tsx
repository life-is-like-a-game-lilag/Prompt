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
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 leading-tight">
              ✨ 프롬프트 작성기
            </h1>
            <div className="w-20 lg:w-32 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mx-auto rounded-full mb-6" aria-hidden="true"></div>
            <p className="text-lg sm:text-xl lg:text-2xl theme-text-secondary mb-4 max-w-3xl mx-auto leading-relaxed px-2">
              🤖 AI와 함께하는 스마트한 프롬프트 작성
              <br className="hidden sm:block" />
              <span className="text-base sm:text-lg lg:text-xl theme-text-secondary opacity-80 block sm:inline mt-2 sm:mt-0">
                <span className="hidden sm:inline"><br /></span>
                당신의 창의성을 극대화하는 최고의 도구
              </span>
            </p>
          </div>
          
          {/* 메인 AI 추천 CTA 섹션 */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-8 lg:mb-12 shadow-2xl border border-blue-200 dark:border-gray-700 hero-gradient" aria-labelledby="ai-recommendation-section">
            <div className="mb-6 lg:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg icon-bounce" aria-hidden="true">
                <span className="text-3xl lg:text-4xl" role="img" aria-label="뇌 이모지">🧠</span>
              </div>
              <h2 id="ai-recommendation-section" className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-text-primary mb-3 lg:mb-4">
                AI 모델 맞춤 추천
              </h2>
              <p className="text-base sm:text-lg lg:text-xl theme-text-secondary max-w-2xl mx-auto leading-relaxed">
                당신의 목적에 가장 적합한 AI 모델과 프롬프트를 
                <br className="hidden sm:block" />
                <span className="font-semibold text-blue-600">단 3분 만에</span> 찾아드립니다
              </p>
            </div>
            
            {/* 주요 기능 하이라이트 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-10" role="list" aria-label="주요 기능">
              <div className="flex flex-col items-center p-4 lg:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md feature-card" role="listitem">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-3" aria-hidden="true">
                  <span className="text-xl lg:text-2xl" role="img" aria-label="번개 이모지">⚡</span>
                </div>
                <h3 className="font-bold text-sm lg:text-base theme-text-primary mb-2">빠른 추천</h3>
                <p className="text-xs lg:text-sm theme-text-secondary text-center">3분 내 최적 AI 모델 발견</p>
              </div>
              <div className="flex flex-col items-center p-4 lg:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md feature-card" role="listitem">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-3" aria-hidden="true">
                  <span className="text-xl lg:text-2xl" role="img" aria-label="타겟 이모지">🎯</span>
                </div>
                <h3 className="font-bold text-sm lg:text-base theme-text-primary mb-2">정확한 매칭</h3>
                <p className="text-xs lg:text-sm theme-text-secondary text-center">목적에 맞는 최적 솔루션</p>
              </div>
              <div className="flex flex-col items-center p-4 lg:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md feature-card" role="listitem">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-3" aria-hidden="true">
                  <span className="text-xl lg:text-2xl" role="img" aria-label="전구 이모지">💡</span>
                </div>
                <h3 className="font-bold text-sm lg:text-base theme-text-primary mb-2">스마트 가이드</h3>
                <p className="text-xs lg:text-sm theme-text-secondary text-center">단계별 친절한 안내</p>
              </div>
            </div>
            
            {/* 메인 AI 추천 시작 버튼 */}
            <div className="space-y-4">
              <a
                href="/recommend"
                className="ai-recommend-button group inline-flex items-center justify-center gap-3 lg:gap-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-4 lg:px-12 lg:py-5 rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl min-w-[280px] lg:min-w-[350px] focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
                role="button"
                aria-label="AI 모델 추천 받기 시작"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = '/recommend'; } }}
              >
                <span className="text-2xl lg:text-3xl group-hover:animate-bounce" role="img" aria-label="로켓 이모지">🚀</span>
                <span>AI 추천 시작하기</span>
                <svg className="w-6 h-6 lg:w-7 lg:h-7 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              
              <p className="text-sm lg:text-base theme-text-secondary" aria-label="서비스 특징">
                💳 완전 무료 • 🔒 안전한 개인정보 • ⚡ 즉시 시작
              </p>
            </div>
          </section>
        </header>
        
        {/* 프롬프트 검색 및 필터링 섹션 */}
        <section className="mb-12 lg:mb-16" aria-labelledby="search-section" id="search">
          <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
              <div className="mb-4 lg:mb-0">
                <h2 id="search-section" className="text-2xl lg:text-3xl font-bold theme-text-primary mb-2">
                  🔍 프롬프트 검색
                </h2>
                <p className="theme-text-secondary text-sm lg:text-base">
                  저장된 프롬프트를 빠르게 찾아보세요
                </p>
              </div>
            </div>
            
            {/* 검색 입력 및 필터 */}
            <div className="space-y-4 lg:space-y-6">
              {/* 검색 입력 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="제목, 설명, 태그로 검색..."
                  className="w-full pl-12 pr-4 py-3 lg:py-4 border border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-2xl theme-input focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base lg:text-lg"
                  aria-label="프롬프트 검색"
                />
              </div>
              
              {/* 필터 및 정렬 */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                {/* 역할 필터 */}
                <select
                  className="flex-1 px-4 py-3 lg:py-4 border border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-2xl theme-input focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                  aria-label="역할별 필터"
                >
                  <option value="">모든 역할</option>
                  <option value="assistant">AI 어시스턴트</option>
                  <option value="creative">창작 도우미</option>
                  <option value="technical">기술 전문가</option>
                  <option value="educational">교육 도우미</option>
                </select>
                
                {/* 정렬 */}
                <select
                  className="flex-1 px-4 py-3 lg:py-4 border border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-2xl theme-input focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                  aria-label="정렬 기준"
                >
                  <option value="newest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="alphabetical">가나다순</option>
                  <option value="usage">사용 빈도순</option>
                </select>
                
                {/* 검색 버튼 */}
                <button
                  type="button"
                  className="px-6 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl lg:rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 text-sm lg:text-base min-w-[80px] lg:min-w-[100px]"
                  aria-label="검색 실행"
                >
                  검색
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
