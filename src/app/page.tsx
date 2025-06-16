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
      {/* 바로가기 메뉴 */}
      <nav className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:bg-white focus-within:dark:bg-gray-800 focus-within:rounded-lg focus-within:shadow-xl focus-within:border focus-within:border-gray-200 focus-within:dark:border-gray-700 focus-within:p-4 focus-within:min-w-[200px]" aria-label="바로가기 메뉴">
        <h2 className="text-sm font-semibold theme-text-primary mb-2">바로가기 메뉴</h2>
        <ul className="space-y-1" role="list">
          <li>
            <a href="#main-content" className="block px-3 py-2 text-sm theme-text-primary hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md focus:outline-none focus:bg-blue-100 dark:focus:bg-blue-900 transition-colors" role="menuitem">
              AI 추천
            </a>
          </li>
          <li>
            <a href="#search" className="block px-3 py-2 text-sm theme-text-primary hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md focus:outline-none focus:bg-blue-100 dark:focus:bg-blue-900 transition-colors" role="menuitem">
              검색
            </a>
          </li>
          <li>
            <a href="#prompt-registration" className="block px-3 py-2 text-sm theme-text-primary hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md focus:outline-none focus:bg-blue-100 dark:focus:bg-blue-900 transition-colors" role="menuitem">
              프롬프트 등록
            </a>
          </li>
          <li>
            <a href="#prompt-list" className="block px-3 py-2 text-sm theme-text-primary hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md focus:outline-none focus:bg-blue-100 dark:focus:bg-blue-900 transition-colors" role="menuitem">
              등록된 프롬프트
            </a>
          </li>
        </ul>
      </nav>
      
      {/* 테마 토글 버튼 */}
      <aside className="fixed top-4 right-4 z-50" aria-label="테마 설정">
        <ThemeToggle />
      </aside>
      
      <main className="container mx-auto px-4 py-6 max-w-6xl" role="main" aria-label="메인 콘텐츠" id="main-content">
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

        {/* 프롬프트 등록 섹션 */}
        <section className="mb-12 lg:mb-16" aria-labelledby="prompt-registration-section" id="prompt-registration">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-green-200 dark:border-gray-700">
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg mx-auto" aria-hidden="true">
                <span className="text-3xl lg:text-4xl" role="img" aria-label="연필 이모지">✏️</span>
              </div>
              <h2 id="prompt-registration-section" className="text-2xl lg:text-3xl font-bold theme-text-primary mb-3 lg:mb-4 text-center">
                프롬프트 등록
              </h2>
              <p className="theme-text-secondary text-center max-w-2xl mx-auto text-sm lg:text-base">
                새로운 프롬프트를 작성하고 저장하여 언제든지 재사용하세요
              </p>
            </div>
            
            {/* 등록 폼 */}
            <form className="space-y-6 lg:space-y-8 max-w-4xl mx-auto" aria-label="프롬프트 등록 폼">
              {/* 제목과 역할 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label htmlFor="prompt-title" className="block text-sm lg:text-base font-semibold theme-text-primary mb-2">
                    제목 <span className="text-red-500" aria-label="필수 입력">*</span>
                  </label>
                  <input
                    type="text"
                    id="prompt-title"
                    placeholder="프롬프트 제목을 입력하세요"
                    className="w-full px-4 py-3 lg:py-4 border border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-2xl theme-input focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base"
                    required
                    aria-describedby="prompt-title-hint"
                  />
                  <p id="prompt-title-hint" className="text-xs lg:text-sm theme-text-secondary mt-1">
                    명확하고 구체적인 제목을 작성해주세요
                  </p>
                </div>
                
                <div>
                  <label htmlFor="prompt-role" className="block text-sm lg:text-base font-semibold theme-text-primary mb-2">
                    AI 역할 <span className="text-red-500" aria-label="필수 입력">*</span>
                  </label>
                  <select
                    id="prompt-role"
                    className="w-full px-4 py-3 lg:py-4 border border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-2xl theme-input focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base"
                    required
                    aria-describedby="prompt-role-hint"
                  >
                    <option value="">역할을 선택하세요</option>
                    <option value="assistant">AI 어시스턴트</option>
                    <option value="creative">창작 도우미</option>
                    <option value="technical">기술 전문가</option>
                    <option value="educational">교육 도우미</option>
                    <option value="analyst">분석 전문가</option>
                    <option value="writer">작가</option>
                    <option value="translator">번역가</option>
                  </select>
                  <p id="prompt-role-hint" className="text-xs lg:text-sm theme-text-secondary mt-1">
                    AI가 수행할 역할을 선택해주세요
                  </p>
                </div>
              </div>
              
              {/* 설명 */}
              <div>
                <label htmlFor="prompt-description" className="block text-sm lg:text-base font-semibold theme-text-primary mb-2">
                  설명
                </label>
                <textarea
                  id="prompt-description"
                  rows={3}
                  placeholder="프롬프트에 대한 간단한 설명을 입력하세요"
                  className="w-full px-4 py-3 lg:py-4 border border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-2xl theme-input focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical text-sm lg:text-base"
                  aria-describedby="prompt-description-hint"
                />
                <p id="prompt-description-hint" className="text-xs lg:text-sm theme-text-secondary mt-1">
                  이 프롬프트의 용도와 특징을 설명해주세요
                </p>
              </div>
              
              {/* 프롬프트 내용 */}
              <div>
                <label htmlFor="prompt-content" className="block text-sm lg:text-base font-semibold theme-text-primary mb-2">
                  프롬프트 내용 <span className="text-red-500" aria-label="필수 입력">*</span>
                </label>
                <textarea
                  id="prompt-content"
                  rows={8}
                  placeholder="AI에게 전달할 프롬프트를 작성하세요..."
                  className="w-full px-4 py-3 lg:py-4 border border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-2xl theme-input focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical text-sm lg:text-base font-mono"
                  required
                  aria-describedby="prompt-content-hint"
                />
                <p id="prompt-content-hint" className="text-xs lg:text-sm theme-text-secondary mt-1">
                  구체적이고 명확한 지시사항을 포함해주세요
                </p>
              </div>
              
              {/* 태그 */}
              <div>
                <label htmlFor="prompt-tags" className="block text-sm lg:text-base font-semibold theme-text-primary mb-2">
                  태그
                </label>
                <input
                  type="text"
                  id="prompt-tags"
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 글쓰기, 창작, 소설)"
                  className="w-full px-4 py-3 lg:py-4 border border-gray-300 dark:border-gray-600 rounded-xl lg:rounded-2xl theme-input focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base"
                  aria-describedby="prompt-tags-hint"
                />
                <p id="prompt-tags-hint" className="text-xs lg:text-sm theme-text-secondary mt-1">
                  검색 시 활용할 키워드를 추가해주세요
                </p>
              </div>
              
              {/* 등록 버튼 */}
              <div className="text-center pt-4 lg:pt-6">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-3 lg:gap-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-8 py-4 lg:px-12 lg:py-5 rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl min-w-[280px] lg:min-w-[320px] focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75"
                  aria-label="프롬프트 등록하기"
                >
                  <span className="text-2xl lg:text-3xl" role="img" aria-label="저장 이모지">💾</span>
                  <span>프롬프트 등록</span>
                </button>
                
                <p className="text-xs lg:text-sm theme-text-secondary mt-4">
                  등록된 프롬프트는 언제든지 수정하거나 삭제할 수 있습니다
                </p>
              </div>
            </form>
          </div>
        </section>

        {/* 등록된 프롬프트 목록 섹션 */}
        <section className="mb-12 lg:mb-16" aria-labelledby="prompt-list-section" id="prompt-list">
          <div className="mb-6 lg:mb-8">
            <h2 id="prompt-list-section" className="text-2xl lg:text-3xl font-bold theme-text-primary mb-3 text-center">
              📋 등록된 프롬프트
            </h2>
            <p className="theme-text-secondary text-center text-sm lg:text-base">
              저장된 프롬프트를 확인하고 관리하세요
            </p>
          </div>
          
          {/* 프롬프트 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6" role="list" aria-label="등록된 프롬프트 목록">
            {/* 샘플 프롬프트 카드 1 */}
            <article className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group" role="listitem" aria-labelledby="prompt-1-title">
              <div className="mb-3 lg:mb-4">
                <div className="flex items-start justify-between mb-2">
                                     <h3 id="prompt-1-title" className="text-lg lg:text-xl font-bold dark:text-gray-100 text-gray-900 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                     창작 소설 작성 도우미
                   </h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 ml-2 flex-shrink-0" aria-label="역할: 창작 도우미">
                    창작 도우미
                  </span>
                </div>
                                 <p className="dark:text-gray-300 text-gray-600 text-sm lg:text-base line-clamp-2 leading-relaxed">
                   장르별 소설 창작을 도와주는 전문 프롬프트입니다. 캐릭터 개발부터 플롯 구성까지 체계적으로 안내합니다.
                 </p>
              </div>
              
              <div className="mb-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <p className="dark:text-gray-100 text-gray-800 text-sm font-mono line-clamp-3 leading-relaxed">
                    당신은 전문 소설가입니다. 사용자가 제공하는 장르와 주제에 맞는 흥미진진한 소설을 창작해주세요. 다음 요소들을 포함해야 합니다: 1) 매력적인 캐릭터 설정 2) 긴장감 있는 플롯 3) 생생한 묘사...
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1.5" role="list" aria-label="태그">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" role="listitem">글쓰기</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" role="listitem">소설</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" role="listitem">창작</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs theme-text-secondary mb-4">
                <span aria-label="생성일">2024년 12월 15일</span>
                <span aria-label="수정일">수정: 12월 16일</span>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75" aria-label="프롬프트 복사">
                  📋 복사
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75" aria-label="프롬프트 수정">
                  ✏️ 수정
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75" aria-label="프롬프트 삭제">
                  🗑️
                </button>
              </div>
            </article>
            
            {/* 샘플 프롬프트 카드 2 */}
            <article className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group" role="listitem" aria-labelledby="prompt-2-title">
              <div className="mb-3 lg:mb-4">
                <div className="flex items-start justify-between mb-2">
                                     <h3 id="prompt-2-title" className="text-lg lg:text-xl font-bold dark:text-gray-100 text-gray-900 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                     기술 문서 작성 전문가
                   </h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 ml-2 flex-shrink-0" aria-label="역할: 기술 전문가">
                    기술 전문가
                  </span>
                </div>
                                 <p className="dark:text-gray-300 text-gray-600 text-sm lg:text-base line-clamp-2 leading-relaxed">
                   개발자를 위한 명확하고 체계적인 기술 문서 작성을 도와주는 프롬프트입니다.
                 </p>
              </div>
              
              <div className="mb-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <p className="dark:text-gray-100 text-gray-800 text-sm font-mono line-clamp-3 leading-relaxed">
                    당신은 경험이 풍부한 기술 문서 작성 전문가입니다. 개발자들이 쉽게 이해할 수 있도록 명확하고 체계적인 기술 문서를 작성해주세요. API 문서, 설치 가이드, 사용법 등을 포함해야 합니다...
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1.5" role="list" aria-label="태그">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" role="listitem">기술문서</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" role="listitem">개발</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" role="listitem">API</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs theme-text-secondary mb-4">
                <span aria-label="생성일">2024년 12월 14일</span>
                <span aria-label="수정일">수정: 12월 15일</span>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75" aria-label="프롬프트 복사">
                  📋 복사
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75" aria-label="프롬프트 수정">
                  ✏️ 수정
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75" aria-label="프롬프트 삭제">
                  🗑️
                </button>
              </div>
            </article>
            
            {/* 새 프롬프트 추가 카드 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center text-center min-h-[280px]" role="button" aria-label="새 프롬프트 추가" tabIndex={0}>
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                <span className="text-3xl lg:text-4xl" role="img" aria-label="플러스 이모지">➕</span>
              </div>
              <h3 className="text-lg lg:text-xl font-bold theme-text-primary mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                새 프롬프트 추가
              </h3>
              <p className="theme-text-secondary text-sm lg:text-base">
                위의 등록 폼을 사용해서<br />새로운 프롬프트를 만들어보세요
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
