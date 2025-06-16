'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// 키보드 네비게이션 훅
export function useKeyboardNavigation(
  items: HTMLElement[] | (() => HTMLElement[]),
  options: {
    loop?: boolean;
    horizontal?: boolean;
    onSelect?: (index: number, element: HTMLElement) => void;
  } = {}
) {
  const { loop = true, horizontal = false, onSelect } = options;
  const [currentIndex, setCurrentIndex] = useState(-1);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const itemList = typeof items === 'function' ? items() : items;
    if (itemList.length === 0) return;

    let nextIndex = currentIndex;
    const isNext = horizontal ? 
      (event.key === 'ArrowRight' || event.key === 'ArrowDown') :
      event.key === 'ArrowDown';
    const isPrev = horizontal ?
      (event.key === 'ArrowLeft' || event.key === 'ArrowUp') :
      event.key === 'ArrowUp';

    if (isNext) {
      event.preventDefault();
      nextIndex = currentIndex + 1;
      if (nextIndex >= itemList.length) {
        nextIndex = loop ? 0 : itemList.length - 1;
      }
    } else if (isPrev) {
      event.preventDefault();
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) {
        nextIndex = loop ? itemList.length - 1 : 0;
      }
    } else if (event.key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      nextIndex = itemList.length - 1;
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (currentIndex >= 0 && currentIndex < itemList.length) {
        event.preventDefault();
        onSelect?.(currentIndex, itemList[currentIndex]);
        itemList[currentIndex].click();
      }
    }

    if (nextIndex !== currentIndex && nextIndex >= 0 && nextIndex < itemList.length) {
      setCurrentIndex(nextIndex);
      itemList[nextIndex].focus();
    }
  }, [currentIndex, items, loop, horizontal, onSelect]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    currentIndex,
    setCurrentIndex,
    focusItem: (index: number) => {
      const itemList = typeof items === 'function' ? items() : items;
      if (index >= 0 && index < itemList.length) {
        setCurrentIndex(index);
        itemList[index].focus();
      }
    }
  };
}

// 포커스 관리 훅
export function useFocusManagement() {
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    lastFocusedElement.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (lastFocusedElement.current && typeof lastFocusedElement.current.focus === 'function') {
      lastFocusedElement.current.focus();
    }
  }, []);

  const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const focusFirstElement = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElement = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;

    if (focusableElement) {
      focusableElement.focus();
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
    focusFirstElement
  };
}

// 스크린리더 공지 훅
export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(message);
    
    // aria-live 영역에 메시지 설정
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // 메시지 클리어 (스크린리더가 읽은 후)
      setTimeout(() => {
        liveRegion.textContent = '';
        setAnnouncement('');
      }, 1000);
    }
  }, []);

  return {
    announcement,
    announce
  };
}

// 건너뛰기 링크 훅
export function useSkipLinks() {
  const createSkipLink = useCallback((targetId: string, text: string) => {
    return {
      href: `#${targetId}`,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      className: 'skip-link',
      children: text
    };
  }, []);

  return { createSkipLink };
}

// 접근성 상태 확인 훅
export function useAccessibilityChecker() {
  const [violations, setViolations] = useState<string[]>([]);

  const checkAccessibility = useCallback(() => {
    const issues: string[] = [];

    // 기본적인 접근성 체크
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length}개의 이미지에 alt 속성이 없습니다.`);
    }

    const buttons = document.querySelectorAll('button:not([aria-label]):not(:has(text))');
    if (buttons.length > 0) {
      issues.push(`${buttons.length}개의 버튼에 접근 가능한 이름이 없습니다.`);
    }

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push('페이지에 헤딩 요소가 없습니다.');
    }

    const links = document.querySelectorAll('a:not([href])');
    if (links.length > 0) {
      issues.push(`${links.length}개의 링크에 href 속성이 없습니다.`);
    }

    setViolations(issues);
    return issues;
  }, []);

  useEffect(() => {
    // 개발 환경에서만 체크
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(checkAccessibility, 1000);
      return () => clearTimeout(timer);
    }
  }, [checkAccessibility]);

  return {
    violations,
    checkAccessibility
  };
}

// 키보드 단축키 훅
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + 키 조합
      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase();
        const shortcut = shortcuts[key];
        if (shortcut) {
          event.preventDefault();
          shortcut();
        }
      }

      // 전역 단축키 (Ctrl 없이)
      if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        const key = event.key;
        const shortcut = shortcuts[key];
        if (shortcut && !isInputFocused()) {
          event.preventDefault();
          shortcut();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// 유틸리티 함수들
function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  return !!(activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.tagName === 'SELECT' ||
    activeElement.getAttribute('contenteditable') === 'true'
  ));
}

// 접근성 ID 생성 훅
export function useAccessibleId(prefix: string = 'accessible') {
  const id = useRef<string>(`${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return id.current;
} 