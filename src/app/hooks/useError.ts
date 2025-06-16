import { useState, useCallback } from 'react';

export interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
}

export function useError() {
  const [error, setError] = useState<ErrorState | null>(null);

  const showError = useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error', code?: string) => {
    setError({ message, type, code });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleApiError = useCallback((error: any, customMessage?: string) => {
    console.error('API 에러:', error);

    let message = customMessage || '알 수 없는 오류가 발생했습니다.';
    let type: 'error' | 'warning' | 'info' = 'error';
    let code: string | undefined;

    if (error instanceof TypeError && error.message.includes('fetch')) {
      // 네트워크 연결 오류
      message = '네트워크 연결을 확인해주세요. 인터넷 연결이 불안정하거나 서버가 응답하지 않습니다.';
      code = 'NETWORK_ERROR';
    } else if (error.name === 'AbortError') {
      // 요청 타임아웃
      message = '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
      code = 'TIMEOUT_ERROR';
    } else if (error.status) {
      // HTTP 상태 코드 기반 에러
      switch (error.status) {
        case 400:
          message = '잘못된 요청입니다. 입력 내용을 확인해주세요.';
          code = 'BAD_REQUEST';
          break;
        case 401:
          message = '인증이 필요합니다. 로그인을 확인해주세요.';
          code = 'UNAUTHORIZED';
          break;
        case 403:
          message = '접근 권한이 없습니다.';
          code = 'FORBIDDEN';
          break;
        case 404:
          message = '요청한 리소스를 찾을 수 없습니다.';
          code = 'NOT_FOUND';
          break;
        case 429:
          message = '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
          code = 'TOO_MANY_REQUESTS';
          type = 'warning';
          break;
        case 500:
          message = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
          code = 'SERVER_ERROR';
          break;
        case 502:
        case 503:
        case 504:
          message = '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
          code = 'SERVER_UNAVAILABLE';
          break;
        default:
          message = `서버 오류가 발생했습니다. (${error.status})`;
          code = 'HTTP_ERROR';
      }
    } else if (typeof error === 'string') {
      message = error;
    } else if (error.message) {
      message = error.message;
    }

    setError({ message, type, code });
  }, []);

  const retryWithError = useCallback((retryFn: () => Promise<void>) => {
    return async () => {
      clearError();
      try {
        await retryFn();
      } catch (error) {
        handleApiError(error);
      }
    };
  }, [clearError, handleApiError]);

  return {
    error,
    showError,
    clearError,
    handleApiError,
    retryWithError
  };
} 