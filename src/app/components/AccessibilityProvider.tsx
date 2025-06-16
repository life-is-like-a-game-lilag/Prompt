'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useKeyboardShortcuts, useAnnouncement } from '../hooks/useAccessibility';

interface AccessibilityContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  isHighContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  isLargeText: boolean;
  setLargeText: (enabled: boolean) => void;
  isReducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export default function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const { announce } = useAnnouncement();
  const [isHighContrast, setHighContrast] = useState(false);
  const [isLargeText, setLargeText] = useState(false);
  const [isReducedMotion, setReducedMotion] = useState(false);
  const [isSkipMenuOpen, setIsSkipMenuOpen] = useState(false);

  // 시스템 설정 감지
  useEffect(() => {
    // 고대비 모드 감지
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(highContrastQuery.matches);
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // 애니메이션 감소 설정 감지
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // Escape 키로 메뉴 닫기
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        
        // details 요소 닫기 (키보드 단축키 도움말)
        const openDetails = document.querySelector('details[open]') as HTMLDetailsElement;
        if (openDetails) {
          openDetails.open = false;
          announce('도움말이 닫혔습니다.');
          return;
        }
        
        // 모달 닫기 (있다면)
        const modal = document.querySelector('.modal-overlay') as HTMLElement;
        if (modal) {
          const closeButton = modal.querySelector('[aria-label*="닫기"], .modal-close') as HTMLElement;
          if (closeButton) {
            closeButton.click();
            announce('모달이 닫혔습니다.');
          }
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [announce]);

  // 접근성 설정 적용
  useEffect(() => {
    const root = document.documentElement;
    
    // CSS 변수로 설정 적용
    root.style.setProperty('--accessibility-high-contrast', isHighContrast ? '1' : '0');
    root.style.setProperty('--accessibility-large-text', isLargeText ? '1' : '0');
    root.style.setProperty('--accessibility-reduced-motion', isReducedMotion ? '1' : '0');

    // CSS 클래스 적용
    root.classList.toggle('high-contrast', isHighContrast);
    root.classList.toggle('large-text', isLargeText);
    root.classList.toggle('reduced-motion', isReducedMotion);
  }, [isHighContrast, isLargeText, isReducedMotion]);

  // 키보드 단축키 설정
  useKeyboardShortcuts({
    // Ctrl + K: 검색으로 이동
    'k': () => {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="검색"]') as HTMLElement;
      if (searchInput) {
        searchInput.focus();
        announce('검색 필드로 이동했습니다.');
      }
    },
    // Ctrl + H: 홈으로 이동
    'h': () => {
      const homeLink = document.querySelector('a[href="/"], a[href="#home"]') as HTMLElement;
      if (homeLink) {
        homeLink.click();
        announce('홈 페이지로 이동합니다.');
      }
    },
    // Ctrl + M: 메인 콘텐츠로 이동
    'm': () => {
      const mainContent = document.querySelector('main, #main-content') as HTMLElement;
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
        announce('메인 콘텐츠로 이동했습니다.');
      }
    },
    // Ctrl + N: 네비게이션으로 이동
    'n': () => {
      const navigation = document.querySelector('nav, [role="navigation"]') as HTMLElement;
      if (navigation) {
        const firstLink = navigation.querySelector('a, button') as HTMLElement;
        if (firstLink) {
          firstLink.focus();
          announce('네비게이션으로 이동했습니다.');
        }
      }
    }
  });

  const contextValue: AccessibilityContextType = {
    announce,
    isHighContrast,
    setHighContrast,
    isLargeText,
    setLargeText,
    isReducedMotion,
    setReducedMotion
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* 바로가기 메뉴 */}
      <div className="skip-links">
        <div className="skip-menu-container">
          <button 
            className="skip-menu-trigger"
            onMouseEnter={() => setIsSkipMenuOpen(true)}
            onMouseLeave={() => setIsSkipMenuOpen(false)}
            aria-label="바로가기 메뉴 열기"
            aria-expanded={isSkipMenuOpen}
            aria-haspopup="menu"
          >
            ⚡ 바로가기 메뉴
            <svg className="skip-menu-arrow" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div 
            className={`skip-menu-dropdown ${isSkipMenuOpen ? 'skip-menu-open' : ''}`} 
            role="menu" 
            aria-label="바로가기 메뉴"
            onMouseLeave={() => setIsSkipMenuOpen(false)}
          >
            <a 
              href="#main-content" 
              className="skip-link"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                setIsSkipMenuOpen(false);
                const target = document.getElementById('main-content');
                if (target) {
                  target.focus();
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  announce('AI 추천으로 이동했습니다.');
                }
              }}
              onFocus={() => announce('AI 추천으로 이동')}
            >
              🤖 AI 추천
            </a>
            <a 
              href="#search" 
              className="skip-link"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                setIsSkipMenuOpen(false);
                const target = document.getElementById('search') || 
                              document.querySelector('input[type="search"]') ||
                              document.querySelector('input[placeholder*="검색"]');
                if (target) {
                  (target as HTMLElement).focus();
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  announce('검색으로 이동했습니다.');
                } else {
                  announce('검색을 찾을 수 없습니다.');
                }
              }}
              onFocus={() => announce('검색으로 이동')}
            >
              🔍 검색
            </a>
            <a 
              href="#prompt-form" 
              className="skip-link"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                setIsSkipMenuOpen(false);
                const target = document.getElementById('prompt-form') || 
                              document.querySelector('form') ||
                              document.querySelector('input[type="text"]');
                if (target) {
                  (target as HTMLElement).focus();
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  announce('프롬프트 등록으로 이동했습니다.');
                } else {
                  announce('프롬프트 등록을 찾을 수 없습니다.');
                }
              }}
              onFocus={() => announce('프롬프트 등록으로 이동')}
            >
              ✍️ 프롬프트 등록
            </a>
          </div>
        </div>
      </div>

      {/* aria-live 공지 영역 */}
      <div
        id="aria-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />

      {/* 키보드 단축키 도움말 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="accessibility-debug">
          <details className="keyboard-shortcuts-help">
            <summary>키보드 단축키 도움말</summary>
            <dl>
              <dt>Ctrl + K</dt>
              <dd>검색으로 이동</dd>
              <dt>Ctrl + H</dt>
              <dd>홈으로 이동</dd>
              <dt>Ctrl + M</dt>
              <dd>메인 콘텐츠로 이동</dd>
              <dt>Ctrl + N</dt>
              <dd>네비게이션으로 이동</dd>
              <dt>Tab / Shift+Tab</dt>
              <dd>포커스 이동</dd>
              <dt>Enter / Space</dt>
              <dd>버튼/링크 활성화</dd>
              <dt>Arrow Keys</dt>
              <dd>목록 네비게이션</dd>
              <dt>Escape</dt>
              <dd>도움말 닫기</dd>
            </dl>
          </details>
        </div>
      )}

      {children}
    </AccessibilityContext.Provider>
  );
}

// 접근성 설정 토글 컴포넌트
export function AccessibilityControls() {
  const { 
    isHighContrast, 
    setHighContrast, 
    isLargeText, 
    setLargeText,
    isReducedMotion,
    setReducedMotion,
    announce 
  } = useAccessibility();

  return (
    <div className="accessibility-controls" role="group" aria-labelledby="accessibility-controls-heading">
      <h3 id="accessibility-controls-heading" className="text-lg font-semibold mb-4">
        접근성 설정
      </h3>
      
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isHighContrast}
            onChange={(e) => {
              setHighContrast(e.target.checked);
              announce(e.target.checked ? '고대비 모드가 켜졌습니다.' : '고대비 모드가 꺼졌습니다.');
            }}
            className="w-4 h-4"
            aria-describedby="high-contrast-desc"
          />
          <span className="font-medium">고대비 모드</span>
          <span id="high-contrast-desc" className="sr-only">
            배경과 텍스트의 대비를 높여 가독성을 향상시킵니다.
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isLargeText}
            onChange={(e) => {
              setLargeText(e.target.checked);
              announce(e.target.checked ? '큰 텍스트 모드가 켜졌습니다.' : '큰 텍스트 모드가 꺼졌습니다.');
            }}
            className="w-4 h-4"
            aria-describedby="large-text-desc"
          />
          <span className="font-medium">큰 텍스트</span>
          <span id="large-text-desc" className="sr-only">
            모든 텍스트 크기를 확대하여 가독성을 향상시킵니다.
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isReducedMotion}
            onChange={(e) => {
              setReducedMotion(e.target.checked);
              announce(e.target.checked ? '애니메이션 감소 모드가 켜졌습니다.' : '애니메이션 감소 모드가 꺼졌습니다.');
            }}
            className="w-4 h-4"
            aria-describedby="reduced-motion-desc"
          />
          <span className="font-medium">애니메이션 감소</span>
          <span id="reduced-motion-desc" className="sr-only">
            페이지의 애니메이션과 전환 효과를 최소화합니다.
          </span>
        </label>
      </div>
    </div>
  );
} 