# 🏗️ 프로젝트 아키텍처 (Project Architecture)

> 프롬프트 작성기의 전체 구조와 각 파일의 역할 설명

---

## 📋 전체 아키텍처 개요

```
프롬프트 작성기
├── 백엔드 API 서버 (Node.js + TypeScript + PostgreSQL)
├── 프론트엔드 웹앱 (React, 추후 개발)
└── AI 플랫폼 연동 (OpenAI, Google AI 등, T-003)
```

### 핵심 기능 플로우
1. **사용자 요구사항 입력** → AI 모델 추천
2. **카테고리/키워드 선택** → 프롬프트 템플릿 추천  
3. **템플릿 편집/커스터마이징** → 버전 관리
4. **피드백 제출** → 추천 품질 개선
5. **사용 로그 수집** → 사용 패턴 분석

---

## 📁 디렉토리 구조 상세

```
Prompt/                              # 프로젝트 루트
├── .vooster/                        # Vooster 프로젝트 관리
│   └── project.json                 # 프로젝트 S5QK 메타데이터
├── backend/                         # 백엔드 API 서버
│   ├── src/                         # TypeScript 소스 코드
│   │   ├── index.ts                 # 🚀 서버 진입점
│   │   ├── db.ts                    # 🗄️ 데이터베이스 연결
│   │   ├── schema.sql               # 📋 DB 스키마 정의
│   │   ├── migrateSchema.ts         # 🔄 스키마 마이그레이션
│   │   ├── initAiData.ts            # 🤖 AI 모델 데이터 초기화
│   │   ├── recommend.ts             # 🎯 AI 모델 추천 엔진
│   │   ├── prompts.ts               # 📝 기본 프롬프트 API
│   │   ├── templates.ts             # 📄 템플릿 관리 API (핵심)
│   │   ├── swagger.ts               # 📚 API 문서화
│   │   ├── testSchema.ts            # 🧪 DB 스키마 테스트
│   │   └── testTemplateApi.ts       # 🧪 API 통합 테스트
│   ├── package.json                 # 📦 의존성 및 스크립트
│   ├── tsconfig.json                # ⚙️ TypeScript 설정
│   └── env.example                  # 🔧 환경변수 예제
├── frontend/                        # 프론트엔드 (추후 개발)
├── docs/                            # 문서화
│   ├── README.md                    # 📖 프로젝트 소개
│   ├── DEVELOPMENT.md               # 📝 개발 로그
│   ├── TROUBLESHOOTING.md           # 🔧 문제 해결 가이드
│   └── ARCHITECTURE.md              # 🏗️ 이 파일
└── .gitignore                       # 🚫 Git 무시 파일
```

---

## 🚀 핵심 파일 분석

### 1. `index.ts` - 서버 진입점
```typescript
역할: Express 서버 설정 및 라우터 등록
├── CORS 설정
├── JSON 파싱 미들웨어
├── 라우터 등록 (/recommend, /prompts, /templates)
├── Swagger 문서화 설정
├── 에러 핸들링
└── 서버 시작 (포트 4000)

의존성: express, cors, dotenv, swagger-ui-express
```

### 2. `db.ts` - 데이터베이스 연결
```typescript
역할: PostgreSQL 연결 관리
├── 환경변수에서 DB 설정 로드
├── 연결 풀 생성 및 관리
├── 연결 상태 확인
└── 에러 핸들링

중요: 모든 API에서 이 파일을 통해 DB 접근
```

### 3. `schema.sql` - 데이터베이스 스키마
```sql
테이블 구조 (총 10개 테이블):
├── ai_providers (AI 제공업체)
├── ai_models (AI 모델 정보)  
├── categories (템플릿 카테고리)
├── tags (태그 시스템)
├── prompt_templates (핵심 템플릿 데이터)
├── recommendation_rules (추천 규칙)
├── user_sessions (사용자 세션)
├── user_feedback (피드백)
├── usage_logs (사용 로그)
└── content_versions (버전 관리)

핵심 관계:
- templates → categories (다대일)
- templates → tags (다대다)
- models → providers (다대일)
```

### 4. `templates.ts` - 템플릿 API (핵심!)
```typescript
12개 엔드포인트:
├── GET /templates (목록 조회 + 페이징)
├── GET /templates/:id (상세 조회)
├── POST /templates (생성)
├── PUT /templates/:id (수정)
├── DELETE /templates/:id (소프트 삭제)
├── POST /templates/:id/copy (복사)
├── POST /templates/:id/favorite (즐겨찾기)
├── GET /templates/:id/export (내보내기)
├── POST /templates/:id/feedback (피드백)
├── GET /templates/:id/stats (통계)
├── POST /templates/recommend (추천)
└── GET /categories (카테고리 목록)

특징:
- 트랜잭션 기반 데이터 무결성
- 자동 버전 관리  
- 태그 시스템
- 소프트 삭제
```

### 5. `recommend.ts` - AI 모델 추천 엔진
```typescript
추천 알고리즘:
├── 키워드 매칭 (가중치 40%)
├── 카테고리 매칭 (가중치 30%)
├── 인기도 (사용 횟수, 가중치 20%)
└── 특별 추천 (가중치 10%)

지원 키워드:
- 용도: writing, coding, analysis, translation
- 복잡도: simple, complex, advanced
- 비용: free, cost, cheap, expensive
- 속도: fast, slow, realtime
```

### 6. `swagger.ts` - API 문서화
```typescript
자동 생성되는 문서:
├── API 명세서 (OpenAPI 3.0)
├── 요청/응답 스키마
├── 예제 데이터
└── 인터랙티브 테스트 UI

접속: http://localhost:4000/api-docs
```

---

## 🗄️ 데이터베이스 설계

### 테이블 관계도
```sql
ai_providers (1) ←→ (N) ai_models
categories (1) ←→ (N) prompt_templates
prompt_templates (N) ←→ (M) tags
prompt_templates (1) ←→ (N) user_feedback
prompt_templates (1) ←→ (N) usage_logs
prompt_templates (1) ←→ (N) content_versions
```

### 핵심 테이블 분석

#### `prompt_templates` (핵심 테이블)
```sql
컬럼 구조:
├── id (Primary Key)
├── title (제목)
├── description (설명)
├── template_content (템플릿 내용)
├── system_role (시스템 역할)
├── category_id (카테고리 FK)
├── usage_count (사용 횟수)
├── rating_avg (평균 평점)
├── is_featured (추천 여부)
├── is_active (활성 상태)
├── created_at (생성일)
└── updated_at (수정일)

인덱스:
- category_id (카테고리별 조회)
- usage_count (인기순 정렬)
- is_featured (추천 템플릿)
- created_at (최신순 정렬)
```

#### `ai_models` (AI 모델 정보)
```sql
현재 지원 모델:
├── OpenAI (GPT-4, GPT-3.5, etc.)
├── Google AI (Gemini Pro, etc.)
├── Anthropic (Claude 3, etc.)
├── Naver (HyperCLOVA, etc.)
└── 기타 오픈소스 모델들

속성:
- name, description
- provider_id (제공업체)
- cost_per_token (비용)
- max_tokens (최대 토큰)
- is_available (사용 가능 여부)
```

---

## 🔄 API 플로우

### 1. 템플릿 추천 플로우
```
사용자 요청 → 키워드 분석 → DB 쿼리 → 점수 계산 → 정렬 → 응답
```

### 2. 새 템플릿 생성 플로우
```
요청 검증 → 트랜잭션 시작 → 템플릿 생성 → 태그 연결 → 버전 생성 → 커밋
```

### 3. 피드백 처리 플로우
```
피드백 저장 → 평점 재계산 → 추천 점수 업데이트 → 사용 로그 기록
```

---

## 🧪 테스트 구조

### 테스트 파일
```typescript
testSchema.ts:
├── 데이터베이스 연결 테스트
├── 테이블 생성 확인
├── 초기 데이터 로드 확인
└── 관계 무결성 검증

testTemplateApi.ts:
├── 12개 API 엔드포인트 테스트
├── 에러 처리 테스트
├── 데이터 검증 테스트
└── 성능 측정
```

### 테스트 시나리오
1. **기본 CRUD 테스트**
2. **검색 및 필터링 테스트**
3. **추천 알고리즘 테스트**
4. **에러 케이스 테스트**
5. **동시성 테스트** (향후)

---

## 🚀 확장성 고려사항

### 현재 지원 규모
- **동시 사용자**: ~100명 (예상)
- **템플릿 수**: ~1,000개
- **일일 API 호출**: ~10,000회
- **데이터베이스 크기**: ~100MB

### 확장 계획 (T-003 이후)
```typescript
성능 최적화:
├── Redis 캐싱 도입
├── Connection Pool 튜닝  
├── 인덱스 최적화
└── CDN 도입 (정적 자원)

기능 확장:
├── 실시간 AI API 연동
├── 사용자 인증 시스템
├── 협업 기능
└── 고급 분석 대시보드
```

---

## 🔧 환경 설정

### 개발 환경
```bash
Node.js: 18.0+
PostgreSQL: 12.0+
TypeScript: 5.0+
```

### 프로덕션 환경 (향후)
```bash
컨테이너: Docker + Docker Compose
웹서버: Nginx (리버스 프록시)
프로세스 관리: PM2
모니터링: Prometheus + Grafana
```

---

## 📈 성능 지표

### 현재 성능
- **API 응답 시간**: ~100ms (평균)
- **DB 쿼리 시간**: ~50ms (평균)
- **메모리 사용량**: ~100MB
- **CPU 사용률**: ~5% (유휴시)

### 목표 성능 (프로덕션)
- **API 응답 시간**: <200ms (95%ile)
- **동시 접속**: 1,000명
- **가용성**: 99.9%
- **데이터 백업**: 일 1회

---

## 🔒 보안 고려사항

### 현재 구현된 보안
```typescript
✅ SQL Injection 방지 (Parameterized Query)
✅ CORS 설정
✅ 환경변수 분리
✅ 입력값 검증 (기본)
```

### 추가 보안 계획 (T-003 이후)
```typescript
🔄 API 키 인증
🔄 Rate Limiting
🔄 HTTPS 강제
🔄 입력값 Sanitization
🔄 로그 모니터링
```

---

## 🎯 다음 단계 (T-003: AI 플랫폼 연동)

### 추가될 파일들
```
backend/src/
├── aiConnectors/
│   ├── openai.ts         # OpenAI API 연동
│   ├── google.ts         # Google AI API 연동
│   ├── naver.ts          # Naver HyperCLOVA 연동
│   └── index.ts          # AI 연동 통합 인터페이스
├── middleware/
│   ├── auth.ts           # 인증 미들웨어
│   ├── rateLimit.ts      # 요청 제한
│   └── validation.ts     # 입력값 검증
└── utils/
    ├── logger.ts         # 로깅 유틸
    ├── cache.ts          # 캐싱 유틸
    └── monitoring.ts     # 모니터링 유틸
```

---

## 📞 문제 해결 시 참고사항

### 파일별 문제 해결
- **서버 시작 실패**: `index.ts`, `db.ts` 확인
- **API 응답 없음**: `templates.ts`, `recommend.ts` 확인
- **데이터베이스 오류**: `schema.sql`, `migrateSchema.ts` 확인
- **테스트 실패**: `testSchema.ts`, `testTemplateApi.ts` 확인

### 로그 위치
```bash
서버 로그: 콘솔 출력 (npm run dev)
데이터베이스 로그: PostgreSQL 로그 디렉토리
에러 로그: 애플리케이션 에러 스택
```

---

*마지막 업데이트: 2025-06-16*

*다음 문서: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 문제 해결 가이드* 