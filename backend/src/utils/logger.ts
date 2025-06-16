/**
 * AI Platform Integration - Logging System
 * 
 * @fileoverview AI 플랫폼 연동을 위한 통합 로깅 시스템
 * @description 
 * - AI API 호출 추적 및 성능 측정
 * - 구조화된 로깅으로 디버깅 효율성 향상
 * - 다양한 로그 레벨 지원 (DEBUG, INFO, WARN, ERROR)
 * - 외부 모니터링 시스템과의 연동 지원
 * 
 * @author AI Development Team
 * @version 1.0.0
 * @since 2024-01-01
 * 
 * @changelog
 * - 2024-01-01: 초기 로깅 시스템 구축 (T-003 Step 2)
 * 
 * @todo
 * - [ ] ELK Stack 연동 추가
 * - [ ] 로그 압축 및 아카이빙 기능
 * - [ ] 실시간 로그 스트리밍 구현
 * 
 * @note
 * 이 로깅 시스템은 AI 플랫폼의 핵심 인프라로,
 * 모든 AI API 호출과 시스템 이벤트를 추적합니다.
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

/**
 * 로그 레벨 enum 정의
 * @description Winston 로그 레벨과 일치하는 열거형
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

/**
 * 로그 메타데이터 인터페이스
 * @description 각 로그 엔트리에 포함될 메타데이터 구조
 */
export interface LogMetadata {
  /** 요청 ID (AI API 호출 추적용) */
  requestId?: string;
  /** 사용자 ID */
  userId?: string;
  /** AI 플랫폼 이름 (OpenAI, Claude, Gemini 등) */
  aiPlatform?: string;
  /** API 엔드포인트 */
  endpoint?: string;
  /** 응답 시간 (밀리초) */
  responseTime?: number;
  /** 토큰 사용량 */
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  /** 에러 코드 */
  errorCode?: string;
  /** 에러 스택 */
  stack?: string;
  /** 작업 이름 (operation name) */
  operation?: string;
  /** 실행 시간 (밀리초) */
  duration?: number;
  /** 성공 여부 */
  success?: boolean;
  /** 추가 컨텍스트 데이터 */
  context?: Record<string, any>;
}

/**
 * 로거 설정 인터페이스
 * @description 로거 초기화에 필요한 설정 옵션들
 */
interface LoggerConfig {
  /** 로그 레벨 */
  level: LogLevel;
  /** 로그 파일 경로 */
  logDir: string;
  /** 콘솔 출력 여부 */
  enableConsole: boolean;
  /** 파일 출력 여부 */
  enableFile: boolean;
  /** 최대 파일 크기 */
  maxFileSize: string;
  /** 최대 보관 일수 */
  maxFiles: string;
  /** JSON 포맷 사용 여부 */
  useJsonFormat: boolean;
}

/**
 * AI Platform Logger 클래스
 * @description AI 플랫폼 연동을 위한 전용 로거
 * 
 * @example
 * ```typescript
 * const logger = AIPlatformLogger.getInstance();
 * logger.logApiCall('user123', 'OpenAI', '/v1/completions', 150, {
 *   input: 100,
 *   output: 50,
 *   total: 150
 * });
 * ```
 */
export class AIPlatformLogger {
  private static instance: AIPlatformLogger;
  private logger!: winston.Logger;
  private config: LoggerConfig;

  /**
   * 싱글톤 인스턴스 생성자
   * @param config 로거 설정 (선택사항)
   * 
   * @note
   * 싱글톤 패턴을 사용하여 애플리케이션 전체에서
   * 일관된 로깅 동작을 보장합니다.
   */
  private constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: LogLevel.INFO,
      logDir: path.join(process.cwd(), 'logs'),
      enableConsole: process.env.NODE_ENV !== 'production',
      enableFile: true,
      maxFileSize: '20m',
      maxFiles: '14d',
      useJsonFormat: true,
      ...config
    };

    this.initializeLogger();
  }

  /**
   * 싱글톤 인스턴스 반환
   * @param config 초기 설정 (최초 호출시에만 적용)
   * @returns AIPlatformLogger 인스턴스
   */
  public static getInstance(config?: Partial<LoggerConfig>): AIPlatformLogger {
    if (!AIPlatformLogger.instance) {
      AIPlatformLogger.instance = new AIPlatformLogger(config);
    }
    return AIPlatformLogger.instance;
  }

  /**
   * Winston 로거 초기화
   * @private
   * 
   * @description
   * - 콘솔 및 파일 출력 설정
   * - 일별 로테이션 설정
   * - 커스텀 포맷 적용
   */
  private initializeLogger(): void {
    const transports: winston.transport[] = [];

    // 콘솔 출력 설정
    if (this.config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
              const metaStr = Object.keys(meta).length > 0 ? 
                `\n${JSON.stringify(meta, null, 2)}` : '';
              return `${timestamp} [${level}]: ${message}${metaStr}`;
            })
          )
        })
      );
    }

    // 파일 출력 설정 (일별 로테이션)
    if (this.config.enableFile) {
      // INFO 레벨 이상 로그
      transports.push(
        new DailyRotateFile({
          filename: path.join(this.config.logDir, 'ai-platform-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: this.config.maxFileSize,
          maxFiles: this.config.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            this.config.useJsonFormat ? 
              winston.format.json() : 
              winston.format.simple()
          )
        })
      );

      // ERROR 레벨 전용 로그
      transports.push(
        new DailyRotateFile({
          filename: path.join(this.config.logDir, 'ai-platform-error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: this.config.maxFileSize,
          maxFiles: this.config.maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    }

    // Winston 로거 생성
    this.logger = winston.createLogger({
      level: this.config.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
      ),
      transports,
      exitOnError: false
    });

    // TODO: 향후 ELK Stack 연동시 HTTP Transport 추가 예정
    // TODO: 실시간 로그 스트리밍을 위한 WebSocket Transport 추가 검토
  }

  /**
   * AI API 호출 로그 기록
   * @param userId 사용자 ID
   * @param aiPlatform AI 플랫폼 이름
   * @param endpoint API 엔드포인트
   * @param responseTime 응답 시간 (밀리초)
   * @param tokenUsage 토큰 사용량
   * @param requestId 요청 ID (선택사항)
   * 
   * @example
   * ```typescript
   * logger.logApiCall('user123', 'OpenAI', '/v1/completions', 1500, {
   *   input: 1000, output: 500, total: 1500
   * });
   * ```
   */
  public logApiCall(
    userId: string,
    aiPlatform: string,
    endpoint: string,
    responseTime: number,
    tokenUsage: LogMetadata['tokenUsage'],
    requestId?: string
  ): void {
    const metadata: LogMetadata = {
      requestId: requestId || this.generateRequestId(),
      userId,
      aiPlatform,
      endpoint,
      responseTime,
      tokenUsage
    };

    this.logger.info('AI API Call completed', metadata);
  }

  /**
   * API 에러 로그 기록
   * @param userId 사용자 ID
   * @param aiPlatform AI 플랫폼 이름
   * @param endpoint API 엔드포인트
   * @param error 에러 객체
   * @param requestId 요청 ID (선택사항)
   */
  public logApiError(
    userId: string,
    aiPlatform: string,
    endpoint: string,
    error: Error,
    requestId?: string
  ): void {
    const metadata: LogMetadata = {
      requestId: requestId || this.generateRequestId(),
      userId,
      aiPlatform,
      endpoint,
      errorCode: (error as any).code || 'UNKNOWN_ERROR',
      stack: error.stack
    };

    this.logger.error(`AI API Error: ${error.message}`, metadata);
  }

  /**
   * 성능 메트릭 로그 기록
   * @param operation 작업 이름
   * @param duration 실행 시간 (밀리초)
   * @param context 추가 컨텍스트
   */
  public logPerformance(
    operation: string,
    duration: number,
    context?: Record<string, any>
  ): void {
    const metadata: LogMetadata = {
      responseTime: duration,
      context
    };

    this.logger.info(`Performance: ${operation} completed in ${duration}ms`, metadata);
  }

  /**
   * 일반 정보 로그 기록
   * @param message 로그 메시지
   * @param metadata 메타데이터 (선택사항)
   */
  public info(message: string, metadata?: LogMetadata): void {
    this.logger.info(message, metadata);
  }

  /**
   * 경고 로그 기록
   * @param message 로그 메시지
   * @param metadata 메타데이터 (선택사항)
   */
  public warn(message: string, metadata?: LogMetadata): void {
    this.logger.warn(message, metadata);
  }

  /**
   * 에러 로그 기록
   * @param message 로그 메시지
   * @param error 에러 객체 (선택사항)
   * @param metadata 메타데이터 (선택사항)
   */
  public error(message: string, error?: Error, metadata?: LogMetadata): void {
    const logData = {
      ...metadata,
      stack: error?.stack,
      errorCode: (error as any)?.code
    };
    this.logger.error(message, logData);
  }

  /**
   * 디버그 로그 기록
   * @param message 로그 메시지
   * @param metadata 메타데이터 (선택사항)
   */
  public debug(message: string, metadata?: LogMetadata): void {
    this.logger.debug(message, metadata);
  }

  /**
   * 요청 ID 생성
   * @public
   * @returns 고유한 요청 ID
   * 
   * @note
   * UUID v4 형식의 요청 ID를 생성하여
   * 분산 환경에서의 요청 추적을 지원합니다.
   */
  public generateRequestId(): string {
    return 'req_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * 로거 설정 업데이트
   * @param newConfig 새로운 설정
   * 
   * @note
   * 런타임에 로거 설정을 동적으로 변경할 수 있습니다.
   * 주로 개발/운영 환경 전환시 사용됩니다.
   */
  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.level = this.config.level;
  }

  /**
   * Winston 로거 인스턴스 반환
   * @returns Winston Logger 인스턴스
   * 
   * @note
   * 특수한 경우에만 직접 Winston 로거에 접근할 때 사용합니다.
   * 일반적으로는 이 클래스의 메서드를 사용하는 것을 권장합니다.
   */
  public getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}

/**
 * 기본 로거 인스턴스 Export
 * @description 애플리케이션 전체에서 사용할 기본 로거
 */
export const logger = AIPlatformLogger.getInstance();

/**
 * 로깅 데코레이터
 * @description 메서드 실행 시간을 자동으로 로깅하는 데코레이터
 * 
 * @example
 * ```typescript
 * class AIService {
 *   @LogExecution('AI Service')
 *   async generateText(prompt: string): Promise<string> {
 *     // AI API 호출 로직
 *   }
 * }
 * ```
 * 
 * @todo
 * - 파라미터 로깅 옵션 추가
 * - 에러 자동 로깅 기능 추가
 */
export function LogExecution(operationName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const requestId = logger.generateRequestId();
      
      logger.debug(`${operationName} started`, { 
        requestId, 
        operation: propertyName 
      });

      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        logger.logPerformance(
          `${operationName}.${propertyName}`,
          duration,
          { requestId, success: true }
        );

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error(
          `${operationName}.${propertyName} failed`,
          error as Error,
          { requestId, duration, success: false }
        );
        
        throw error;
      }
    };

    return descriptor;
  };
}

// FIXME: 현재 로그 레벨이 환경변수로 관리되지 않음 - 환경설정 시스템 구축 후 개선 필요
// TODO: 로그 압축 및 아카이빙 기능 추가 (향후 스토리지 최적화를 위해)
// NOTE: 이 로깅 시스템은 AI 플랫폼 연동의 핵심 인프라로, 모든 컴포넌트에서 활용됩니다. 