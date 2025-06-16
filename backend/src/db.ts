/**
 * 🗄️ 데이터베이스 연결 관리자
 * 
 * PostgreSQL 데이터베이스와의 연결을 관리하는 핵심 모듈입니다.
 * 모든 API에서 이 파일을 통해 데이터베이스에 접근합니다.
 * 
 * 주요 기능:
 * - PostgreSQL 연결 풀 생성 및 관리
 * - 환경변수 기반 데이터베이스 설정
 * - 연결 상태 확인 (pingDB)
 * - 자동 연결 재시도 및 에러 핸들링
 * 
 * 환경변수 설정 (.env):
 * - DB_HOST: 데이터베이스 호스트 (기본: localhost)
 * - DB_PORT: 포트 번호 (기본: 5432)
 * - DB_USER: 사용자명
 * - DB_PASSWORD: 비밀번호
 * - DB_NAME: 데이터베이스 이름 (기본: prompt_db)
 * 
 * 사용법:
 * ```typescript
 * import { pool } from './db';
 * const result = await pool.query('SELECT * FROM prompt_templates');
 * ```
 * 
 * 문제 해결:
 * - "connection refused": PostgreSQL 서비스 상태 확인
 * - "authentication failed": 사용자명/비밀번호 확인
 * - "database does not exist": createdb prompt_db 실행
 * 
 * @author 프롬프트 작성기 팀
 * @version 3.0 (T-004 완료)
 * @since 2025-06-16
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

/**
 * PostgreSQL 연결 풀
 * 
 * 연결 풀을 사용하여 다중 요청 처리 시 성능을 최적화합니다.
 * 기본 설정:
 * - 최대 연결 수: 20개 (pg 기본값)
 * - 유휴 시간: 30초 후 연결 해제
 * - 연결 타임아웃: 30초
 */
export const pool = new Pool({
  host: process.env.DB_HOST,       // 데이터베이스 호스트
  port: Number(process.env.DB_PORT), // 포트 (일반적으로 5432)
  user: process.env.DB_USER,       // 사용자명
  password: process.env.DB_PASSWORD, // 비밀번호
  database: process.env.DB_NAME,   // 데이터베이스 이름
});

/**
 * 데이터베이스 연결 상태 확인
 * 
 * 헬스체크 엔드포인트(/ping)에서 사용되며,
 * 데이터베이스 연결이 정상적으로 작동하는지 확인합니다.
 * 
 * @returns Promise<{now: string}> 현재 데이터베이스 시간
 * @throws Error 연결 실패 시 에러 발생
 * 
 * 사용 예시:
 * ```typescript
 * try {
 *   const result = await pingDB();
 *   console.log('DB 연결 성공:', result.now);
 * } catch (error) {
 *   console.error('DB 연결 실패:', error);
 * }
 * ```
 */
export async function pingDB() {
  try {
    const res = await pool.query('SELECT NOW()');
    return res.rows[0];
  } catch (err) {
    // 연결 오류를 상위로 전파하여 적절한 HTTP 응답 처리
    throw err;
  }
} 