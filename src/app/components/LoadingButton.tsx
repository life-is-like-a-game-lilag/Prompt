import React from 'react';

interface LoadingButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loadingText?: string;
}

const Spinner = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <svg 
      className={`animate-spin ${sizeClasses[size]} text-current`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export default function LoadingButton({
  isLoading,
  disabled = false,
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  loadingText = '처리 중...'
}: LoadingButtonProps) {
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-2',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-3'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}
      `}
    >
      {isLoading && <Spinner size={size === 'lg' ? 'md' : 'sm'} />}
      <span className={isLoading ? 'ml-1' : ''}>
        {isLoading ? loadingText : children}
      </span>
    </button>
  );
}

// 별도 스피너 컴포넌트 export
export { Spinner }; 