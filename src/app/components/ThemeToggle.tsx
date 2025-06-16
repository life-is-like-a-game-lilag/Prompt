'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // 컴포넌트 마운트 후 로컬 스토리지에서 테마 로드
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // 테마 변경 함수
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // 부드러운 전환 효과
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  };

  // 서버 사이드 렌더링 시 버튼 숨김
  if (!mounted) {
    return (
      <div className="theme-toggle opacity-0">
        <span>🌙</span>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle animate-theme-transition group"
      title={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
      aria-label={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
    >
      <span className="transition-transform duration-300 group-hover:scale-110">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
} 