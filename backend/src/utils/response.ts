import { Response } from 'express';
import { StandardApiResponse, ErrorResponse } from '../types/response';

/**
 * 성공 응답을 생성하는 헬퍼 함수
 */
export function createSuccessResponse<T>(
  data?: T,
  message: string = '요청이 성공적으로 처리되었습니다.',
  statusCode: number = 200
): StandardApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    status_code: statusCode
  };
}

/**
 * 에러 응답을 생성하는 헬퍼 함수
 */
export function createErrorResponse(
  error: string,
  message: string = '요청 처리 중 오류가 발생했습니다.',
  statusCode: number = 500,
  details?: any
): ErrorResponse {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
    status_code: statusCode,
    details
  };
}

/**
 * Express Response 객체에 성공 응답을 전송하는 헬퍼 함수
 */
export function sendSuccessResponse<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode?: number
): void {
  const response = createSuccessResponse(data, message, statusCode);
  res.status(response.status_code || 200).json(response);
}

/**
 * Express Response 객체에 에러 응답을 전송하는 헬퍼 함수
 */
export function sendErrorResponse(
  res: Response,
  error: string,
  message?: string,
  statusCode?: number,
  details?: any
): void {
  const response = createErrorResponse(error, message, statusCode, details);
  res.status(response.status_code).json(response);
}

/**
 * 페이지네이션이 있는 응답을 생성하는 헬퍼 함수
 */
export function createPaginatedResponse<T>(
  data: T,
  page: number,
  limit: number,
  total: number,
  message?: string
): StandardApiResponse<T> {
  return {
    success: true,
    data,
    message: message || '데이터를 성공적으로 조회했습니다.',
    timestamp: new Date().toISOString(),
    status_code: 200,
    meta: {
      page,
      limit,
      total,
      version: '1.0.0'
    }
  };
} 