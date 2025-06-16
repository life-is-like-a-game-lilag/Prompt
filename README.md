# 프롬프트 작성기 (Prompt Maker)

> AI 모델과 프롬프트 템플릿을 자동 추천해주는 웹 서비스

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/life-is-like-a-game-lilag/Prompt)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://typescriptlang.org/)

## 🚀 빠른 시작

### 1. 클론 및 설치
```bash
git clone https://github.com/life-is-like-a-game-lilag/Prompt.git
cd Prompt
cd backend
npm install
```

### 2. 환경 설정
```bash
# .env 파일 생성 (backend/.env)
cp .env.example .env

# 필수 환경변수 설정
DATABASE_URL=postgresql://username:password@localhost:5432/prompt_db
PORT=4000
NODE_ENV=development
```

### 3. 데이터베이스 설정
```bash
# PostgreSQL 데이터베이스 생성
createdb prompt_db

# 스키마 마이그레이션
npm run migrate

# 초기 데이터 로드
npm run init-data
```

### 4. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

### 5. 확인
- 🌐 API 서버: http://localhost:4000
- 📚 API 문서: http://localhost:4000/api-docs
- ❤️ 헬스체크: http://localhost:4000/ping

---

## 📁 프로젝트 구조

```
Prompt/
├── .vooster/                    # Vooster 프로젝트 설정
│   └── project.json            # 프로젝트 메타데이터 (S5QK)
├── backend/                     # 백엔드 API 서버
│   ├── src/
│   │   ├── db.ts               # 데이터베이스 연결 설정
│   │   ├── schema.sql          # 전체 DB 스키마 정의
│   │   ├── migrateSchema.ts    # 스키마 마이그레이션 실행
│   │   ├── initAiData.ts       # AI 모델 초기 데이터 생성
│   │   ├── index.ts            # Express 서버 메인 파일
│   │   ├── recommend.ts        # AI 모델 추천 로직
│   │   ├── prompts.ts          # 기본 프롬프트 CRUD
│   │   ├── templates.ts        # 템플릿 관리 메인 API
│   │   ├── swagger.ts          # API 문서화 설정
│   │   ├── testSchema.ts       # DB 스키마 테스트
│   │   └── testTemplateApi.ts  # 템플릿 API 종합 테스트
│   ├── package.json            # 의존성 및 스크립트
│   └── tsconfig.json           # TypeScript 설정
├── frontend/                    # 프론트엔드 (추후 개발)
├── DEVELOPMENT.md              # 상세 개발 로그
└── README.md                   # 이 파일
```

---

## 🗄️ 데이터베이스 스키마

### 핵심 테이블
```sql
ai_providers          # AI 제공업체 (OpenAI, Google 등)
ai_models            # AI 모델 정보 (GPT-4, Claude 등)
categories           # 카테고리 분류
tags                 # 태그 시스템
prompt_templates     # 프롬프트 템플릿 (핵심!)
recommendation_rules # 추천 규칙
user_sessions        # 사용자 세션
user_feedback        # 피드백 시스템
usage_logs          # 사용 로그
content_versions    # 버전 관리
```

### 스키마 관리
```bash
# 스키마 재생성 (주의: 데이터 삭제됨)
npm run migrate

# 스키마 테스트
npm run test-schema

# 초기 데이터 다시 로드
npm run init-data
```

---

## 🔧 API 엔드포인트

### 프롬프트 템플릿 관리
```bash
GET    /templates              # 목록 조회 (페이징, 필터링)
GET    /templates/:id          # 상세 조회
POST   /templates              # 새 템플릿 생성
PUT    /templates/:id          # 업데이트
DELETE /templates/:id          # 삭제 (소프트)
POST   /templates/:id/feedback # 피드백 제출
GET    /templates/:id/stats    # 통계 조회
```

### AI 모델 추천
```bash
POST   /recommend/ai-models    # AI 모델 추천
POST   /recommend/questions    # 대화형 질문 생성
GET    /recommend/ai-models    # 전체 AI 모델 목록
```

### 프롬프트 기능
```bash
POST   /prompts/recommend      # 프롬프트 템플릿 추천
POST   /prompts/:id/copy       # 템플릿 복사
POST   /prompts/:id/favorite   # 즐겨찾기
GET    /prompts/:id/export     # 내보내기 (JSON/텍스트)
```

### 기타
```bash
GET    /ping                   # 헬스체크
GET    /api-docs               # Swagger 문서
```

---

## 🧪 테스트

### 전체 테스트 실행
```bash
# 템플릿 API 테스트
npm run test-templates

# DB 스키마 테스트
npm run test-schema
```

### 수동 테스트 예제
```bash
# 1. 서버 확인
curl http://localhost:4000/ping

# 2. 템플릿 목록 조회
curl "http://localhost:4000/templates?page=1&limit=5"

# 3. AI 모델 추천 테스트
curl -X POST http://localhost:4000/recommend/ai-models \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["writing", "simple", "cost"]}'

# 4. 새 템플릿 생성
curl -X POST http://localhost:4000/templates \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 템플릿",
    "description": "테스트용입니다",
    "template_content": "당신은 {role}입니다. {task}를 해주세요.",
    "system_role": "도움이 되는 AI입니다",
    "category_name": "일반",
    "tags": ["테스트", "일반"]
  }'
```

---

## 🐛 문제 해결 (Troubleshooting)

### 자주 발생하는 문제들

#### 1. 데이터베이스 연결 실패
```bash
# 에러: connection refused
# 해결: PostgreSQL 서비스 실행 확인
pg_ctl status
# 또는
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# PostgreSQL 재시작
brew services restart postgresql      # macOS
sudo systemctl restart postgresql     # Linux
```

#### 2. 스키마 마이그레이션 실패
```bash
# 에러: relation already exists
# 해결: 스키마 초기화 후 재실행
psql -d prompt_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
npm run init-data
```

#### 3. TypeScript 컴파일 에러
```bash
# 해결: 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 글로벌 설치
npm install -g typescript
```

#### 4. API 응답 없음
```bash
# 포트 충돌 확인
lsof -i :4000
netstat -ano | findstr :4000  # Windows

# 프로세스 종료 후 재시작
kill -9 [PID]
npm run dev
```

#### 5. Swagger 문서 안보임
```bash
# 브라우저 캐시 클리어 후
# http://localhost:4000/api-docs 재접속

# 또는 JSON으로 확인
curl http://localhost:4000/api-docs.json
```

---

## 🔧 개발 환경 설정

### 필수 소프트웨어
- **Node.js**: 18.0+ ([다운로드](https://nodejs.org/))
- **PostgreSQL**: 12.0+ ([다운로드](https://postgresql.org/download/))
- **Git**: 최신 버전
- **IDE**: VS Code 추천

### VS Code 확장 추천
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "esbenp.prettier-vscode"
  ]
}
```

### 환경변수 (.env)
```bash
# 데이터베이스
DATABASE_URL=postgresql://username:password@localhost:5432/prompt_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prompt_db
DB_USER=your_username
DB_PASSWORD=your_password

# 서버
PORT=4000
NODE_ENV=development

# API Keys (추후 T-003에서 사용)
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_KEY=your_google_key
NAVER_CLIENT_ID=your_naver_id
NAVER_CLIENT_SECRET=your_naver_secret
```

---

## 📋 개발 가이드

### 새로운 API 엔드포인트 추가
1. `src/templates.ts` 또는 새 파일에 라우터 추가
2. `src/index.ts`에 라우터 등록
3. `src/swagger.ts`에 API 문서 추가
4. 테스트 작성

### 데이터베이스 스키마 변경
1. `src/schema.sql` 수정
2. `npm run migrate` 실행
3. `src/testSchema.ts`에 테스트 추가
4. Git commit

### 새로운 AI 제공업체 추가
1. `src/initAiData.ts`에 제공업체 정보 추가
2. API 연동 로직 구현 (T-003에서 상세 가이드)
3. 추천 규칙 업데이트

---

## 🚨 알려진 이슈

### 1. PowerShell에서 긴 Git 메시지 에러
**문제**: Git commit 메시지가 길 때 PowerShell 에러 발생
**해결**: 짧은 메시지 사용 또는 Git Bash 사용

### 2. 중복 commit 히스토리
**문제**: Git 히스토리가 중복으로 보임
**상태**: 기능적 문제 없음, 추후 squash 예정

### 3. Swagger UI CSS 깨짐
**문제**: 가끔 Swagger UI 스타일 안적용
**해결**: 브라우저 새로고침 (F5)

---

## 📈 성능 최적화 팁

### 데이터베이스
- 인덱스 활용: `categories`, `tags`, `usage_count`
- 페이징 필수: 큰 결과셋 처리 시
- Connection Pool 모니터링

### API
- 캐싱: Redis 도입 검토 (T-003)
- 응답 압축: gzip 활성화
- 요청 검증: Joi 또는 Zod 사용 검토

---

## 🤝 기여 방법

### 1. 이슈 보고
GitHub Issues에 다음 정보 포함:
- 재현 단계
- 예상 결과 vs 실제 결과
- 환경 정보 (OS, Node.js 버전 등)

### 2. 기능 제안
- 기능 설명
- 사용 사례
- 구현 아이디어

### 3. 코드 기여
```bash
# 1. Fork 및 클론
git clone [your-fork-url]

# 2. 브랜치 생성
git checkout -b feature/새기능

# 3. 개발 및 테스트
npm run test-templates

# 4. 커밋 및 푸시
git commit -m "feat: 새로운 기능 추가"
git push origin feature/새기능

# 5. Pull Request 생성
```

---

## 📞 지원

- **개발로그**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **이슈 트래킹**: [GitHub Issues](https://github.com/life-is-like-a-game-lilag/Prompt/issues)
- **API 문서**: http://localhost:4000/api-docs

---

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

---

*마지막 업데이트: 2025-06-16* 