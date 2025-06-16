'use client';

import { useState, useEffect } from 'react';

interface Step {
  id: number;
  label: string;
  description: string;
  icon: string;
  completed: boolean;
  current: boolean;
}

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps?: Array<{
    label: string;
    description: string;
    icon: string;
  }>;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed';
  showLabels?: boolean;
  showPercentage?: boolean;
  onStepClick?: (step: number) => void;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  steps = [
    { label: '목적', description: '작업 목적 파악', icon: '🎯' },
    { label: '복잡도', description: '난이도 수준 확인', icon: '⚙️' },
    { label: '우선순위', description: '중요도 설정', icon: '📊' },
    { label: '완료', description: '추천 결과', icon: '✅' }
  ],
  animated = true,
  size = 'md',
  variant = 'default',
  showLabels = true,
  showPercentage = true,
  onStepClick
}: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progress = Math.min((currentStep / totalSteps) * 100, 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  const processedSteps: Step[] = steps.slice(0, totalSteps).map((step, index) => ({
    id: index + 1,
    label: step.label,
    description: step.description,
    icon: step.icon,
    completed: index + 1 < currentStep,
    current: index + 1 === currentStep
  }));

  const sizeClasses = {
    sm: {
      container: 'py-4',
      progressBar: 'h-2',
      stepCircle: 'w-8 h-8 text-xs',
      label: 'text-xs',
      description: 'text-xs'
    },
    md: {
      container: 'py-6',
      progressBar: 'h-3',
      stepCircle: 'w-10 h-10 text-sm',
      label: 'text-sm',
      description: 'text-xs'
    },
    lg: {
      container: 'py-8',
      progressBar: 'h-4',
      stepCircle: 'w-12 h-12 text-base',
      label: 'text-base',
      description: 'text-sm'
    }
  };

  const classes = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className={`w-full max-w-2xl mx-auto ${classes.container}`}>
        {showPercentage && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold theme-text-secondary">진행 상황</span>
            <span className="text-sm font-bold text-blue-600">{Math.round(progress)}% 완료</span>
          </div>
        )}
        
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${classes.progressBar} overflow-hidden`}>
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out transform origin-left"
            style={{ 
              width: `${animatedProgress}%`,
              transform: animated ? `scaleX(${animatedProgress / 100})` : 'none',
              transformOrigin: 'left'
            }}
          ></div>
        </div>
        
        {showLabels && (
          <div className="flex justify-between mt-3">
            {processedSteps.map((step) => (
              <span 
                key={step.id}
                className={`${classes.label} font-medium transition-colors duration-300 ${
                  step.completed || step.current 
                    ? 'text-blue-600 font-semibold' 
                    : 'theme-text-secondary'
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${classes.container}`}>
      {/* 상단 정보 */}
      {showPercentage && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-blue-50 dark:bg-gray-800 px-6 py-3 rounded-2xl">
            <span className="text-2xl">📈</span>
            <div>
              <div className="font-bold text-lg text-blue-600">{Math.round(progress)}% 완료</div>
              <div className="text-xs theme-text-secondary">
                {currentStep > totalSteps ? '모든 단계 완료!' : `${currentStep}/${totalSteps} 단계`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 스텝 표시 */}
      <div className="relative">
        {/* 배경 라인 */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full transform -translate-y-1/2 z-0"></div>
        
        {/* 진행 라인 */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform -translate-y-1/2 z-10 transition-all duration-700 ease-out"
          style={{ width: `${animatedProgress}%` }}
        ></div>

        {/* 스텝 아이콘들 */}
        <div className="relative z-20 flex justify-between">
          {processedSteps.map((step, index) => (
            <div 
              key={step.id} 
              className="flex flex-col items-center group"
              onClick={() => onStepClick && onStepClick(step.id)}
              role={onStepClick ? "button" : undefined}
              tabIndex={onStepClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (onStepClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onStepClick(step.id);
                }
              }}
            >
              {/* 스텝 원형 아이콘 */}
              <div 
                className={`
                  ${classes.stepCircle} rounded-full flex items-center justify-center font-bold transition-all duration-300 cursor-pointer
                  ${step.completed 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-110' 
                    : step.current 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg animate-pulse transform scale-110' 
                    : 'bg-gray-200 dark:bg-gray-700 theme-text-secondary hover:bg-gray-300 dark:hover:bg-gray-600'
                  }
                  ${onStepClick ? 'hover:scale-125' : ''}
                `}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {step.completed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="emoji">{step.icon}</span>
                )}
              </div>

              {/* 스텝 라벨 */}
              {showLabels && (
                <div className="mt-3 text-center">
                  <div 
                    className={`
                      ${classes.label} font-semibold transition-all duration-300
                      ${step.completed || step.current ? 'text-blue-600' : 'theme-text-secondary'}
                      ${step.current ? 'transform scale-105' : ''}
                    `}
                  >
                    {step.label}
                  </div>
                  {variant === 'detailed' && (
                    <div className={`${classes.description} theme-text-secondary mt-1 opacity-70`}>
                      {step.description}
                    </div>
                  )}
                </div>
              )}

              {/* 현재 단계 펄스 효과 */}
              {step.current && animated && (
                <div className="absolute -inset-2 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 현재 단계 설명 */}
      {variant === 'detailed' && currentStep <= totalSteps && (
        <div className="mt-8 text-center">
          <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-auto">
            <div className="text-2xl mb-2">{processedSteps[currentStep - 1]?.icon}</div>
            <h3 className="font-bold text-lg theme-text-primary mb-2">
              {processedSteps[currentStep - 1]?.label}
            </h3>
            <p className="theme-text-secondary text-sm">
              {processedSteps[currentStep - 1]?.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 