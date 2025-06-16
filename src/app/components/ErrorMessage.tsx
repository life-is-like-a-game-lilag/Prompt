interface ErrorMessageProps {
  error: string | null;
  onRetry?: () => void;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({ 
  error, 
  onRetry, 
  onClose, 
  type = 'error' 
}: ErrorMessageProps) {
  if (!error) return null;

  const getErrorIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  const getErrorStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
      default:
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:hover:bg-yellow-700 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-blue-200';
      default:
        return 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-800 dark:hover:bg-red-700 dark:text-red-200';
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getErrorStyles()} animate-fade-in`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-xl">{getErrorIcon()}</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {type === 'warning' ? '주의사항' : type === 'info' ? '알림' : '오류가 발생했습니다'}
          </h3>
          <div className="mt-2 text-sm">
            <p>{error}</p>
          </div>
          <div className="mt-4 flex space-x-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${getButtonStyles()} transition-colors duration-200`}
              >
                🔄 다시 시도
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${getButtonStyles()} transition-colors duration-200`}
              >
                ✕ 닫기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 