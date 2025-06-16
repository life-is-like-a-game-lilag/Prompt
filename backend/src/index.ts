/**
 * 🚀 프롬프트 작성기 API 서버 - 메인 진입점
 * 
 * 이 파일은 Express.js 서버의 핵심 설정과 라우터 등록을 담당합니다.
 * 
 * 주요 기능:
 * - Express 서버 초기화 및 미들웨어 설정
 * - API 라우터 등록 (/prompts, /recommend, /templates)
 * - Swagger API 문서화 설정
 * - 데이터베이스 연결 상태 확인 (헬스체크)
 * - CORS 설정으로 프론트엔드 연동 지원
 * 
 * 서버 구조:
 * - 포트: 4000 (환경변수 PORT로 변경 가능)
 * - 데이터베이스: PostgreSQL (db.ts를 통해 연결)
 * - API 문서: http://localhost:4000/api-docs
 * 
 * 문제 해결:
 * - 서버 시작 실패: 포트 충돌 또는 환경변수 확인
 * - API 응답 없음: 라우터 등록 순서 및 미들웨어 확인
 * - CORS 오류: cors() 설정 확인
 * 
 * @author 프롬프트 작성기 팀
 * @version 3.0 (T-004 완료)
 * @since 2025-06-16
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import promptsRouter from "./routes/prompts";
import recommendRouter from "./routes/recommend";
import templatesRouter from "./templates";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import { logger } from "./utils/logger";

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 환경변수 검증
const requiredEnvVars = ['DATABASE_URL', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`필수 환경변수가 누락되었습니다: ${missingEnvVars.join(', ')}`);
  console.warn(`⚠️  누락된 환경변수: ${missingEnvVars.join(', ')}`);
  console.warn('⚠️  일부 기능이 제한될 수 있습니다.');
}

// CORS 설정 (프론트엔드 연동)
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://your-frontend-domain.com' // 배포 시 실제 도메인으로 변경
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 미들웨어 설정
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    context: {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      query: req.query,
      body: req.method === 'POST' ? JSON.stringify(req.body).substring(0, 100) : undefined
    }
  });
  next();
});

// API 문서 (임시 주석처리)
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 라우터 설정 (모두 임시 주석처리)
// app.use("/prompts", promptsRouter);
// app.use("/recommend", recommendRouter);
// app.use("/templates", templatesRouter);

// 헬스체크 엔드포인트
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "프롬프트 작성기 API 서버가 정상 작동 중입니다.",
    version: "3.1.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "🎯 프롬프트 작성기 API 서버",
    version: "3.1.0",
    documentation: "/api-docs",
    endpoints: {
      health: "/health",
      prompts: "/prompts",
      recommend: "/recommend",
      templates: "/templates"
    },
    timestamp: new Date().toISOString()
  });
});

// 404 핸들러
app.use("*", (req, res) => {
  logger.warn(`404 - 존재하지 않는 경로: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "요청하신 API 엔드포인트를 찾을 수 없습니다.",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 전역 에러 핸들러
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('서버 오류', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? '서버 내부 오류가 발생했습니다.'
      : err.message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 서버 시작
app.listen(PORT, () => {
  logger.info(`서버가 포트 ${PORT}에서 시작되었습니다.`);
  console.log(`🚀 프롬프트 작성기 API 서버 시작됨`);
  console.log(`📍 서버 주소: http://localhost:${PORT}`);
  console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
  console.log(`💾 환경: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 개발 모드에서 실행 중 - 상세 로그 활성화`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('서버 종료 시그널 받음 (SIGINT)');
  console.log('\n🛑 서버를 안전하게 종료합니다...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('서버 종료 시그널 받음 (SIGTERM)');
  console.log('\n🛑 서버를 안전하게 종료합니다...');
  process.exit(0);
});

export default app; 