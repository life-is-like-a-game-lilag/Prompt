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
import promptsRouter from "./prompts";
import recommendRouter from "./recommend";
import templatesRouter from "./templates";
import { setupSwagger } from "./swagger";

// 환경변수 로드 (.env 파일에서 DATABASE_URL, PORT 등)
dotenv.config();

// Express 애플리케이션 인스턴스 생성
const app = express();
const PORT = process.env.PORT || 4000; // 기본 포트 4000, 환경변수로 변경 가능

// 미들웨어 설정
app.use(cors()); // CORS 허용 (프론트엔드 연동용)
app.use(express.json()); // JSON 요청 바디 파싱

/**
 * 루트 엔드포인트 - 서버 실행 상태 확인
 * GET /
 */
app.get("/", (_req, res) => {
  res.send("Backend API is running");
});

/**
 * 헬스체크 엔드포인트 - 서버 및 데이터베이스 연결 상태 확인
 * GET /ping
 * 
 * 응답 예시:
 * - 성공: { "success": true, "time": "2025-06-16T10:30:00.000Z" }
 * - 실패: { "success": false, "error": "connection refused" }
 */
app.get("/ping", async (_req, res) => {
  try {
    const { pingDB } = await import("./db");
    const result = await pingDB();
    res.json({ success: true, time: result.now });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// API 라우터 등록
app.use("/prompts", promptsRouter);     // 기본 프롬프트 관리 API
app.use("/recommend", recommendRouter); // AI 모델 추천 API
app.use("/templates", templatesRouter); // 템플릿 관리 API (핵심)

// Swagger API 문서화 설정
// 접속: http://localhost:4000/api-docs
setupSwagger(app);

/**
 * 서버 시작
 * 환경변수 PORT 또는 기본값 4000 포트에서 리스닝
 */
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
  console.log(`❤️ 헬스체크: http://localhost:${PORT}/ping`);
}); 