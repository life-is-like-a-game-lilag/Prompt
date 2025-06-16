# 🔧 문제 해결 가이드 (Troubleshooting Guide)

> 프롬프트 작성기 개발 중 발생할 수 있는 문제들과 해결 방법

---

## 🚨 긴급 문제 해결

### 서버가 시작되지 않을 때
```bash
# 1. 포트 충돌 확인
netstat -ano | findstr :4000    # Windows
lsof -i :4000                   # macOS/Linux

# 2. 프로세스 강제 종료
taskkill /PID [PID번호] /F      # Windows  
kill -9 [PID번호]               # macOS/Linux

# 3. 서버 재시작
cd backend
npm run dev
```

### 데이터베이스 연결 실패
```bash
# PostgreSQL 상태 확인
pg_ctl status

# PostgreSQL 재시작 (Windows)
net stop postgresql-x64-14
net start postgresql-x64-14

# PostgreSQL 재시작 (macOS)
brew services restart postgresql

# 연결 테스트
psql -h localhost -U your_username -d prompt_db
```

---

## 🐛 자주 발생하는 오류

### 1. "relation does not exist" 오류
**원인**: 데이터베이스 스키마가 없거나 잘못됨
```bash
# 해결 방법
cd backend
npm run migrate
npm run init-data

# 또는 완전 리셋
npm run db-reset
```

### 2. "Cannot find module" TypeScript 오류  
**원인**: 의존성 설치 문제
```bash
# 해결 방법
rm -rf node_modules package-lock.json
npm install

# TypeScript 글로벌 설치
npm install -g typescript ts-node
```

### 3. "EADDRINUSE" 포트 사용 중 오류
**원인**: 4000번 포트가 다른 프로세스에 의해 사용 중
```bash
# Windows에서 포트 사용 프로세스 찾기
netstat -ano | findstr :4000
taskkill /PID [PID] /F

# macOS/Linux에서 포트 사용 프로세스 찾기
lsof -i :4000
kill -9 [PID]

# 다른 포트로 실행
PORT=4001 npm run dev
```

### 4. "Invalid JSON" API 요청 오류
**원인**: 요청 데이터 형식 문제
```bash
# 올바른 curl 요청 예제
curl -X POST http://localhost:4000/templates \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 템플릿",
    "description": "설명",
    "template_content": "내용",
    "system_role": "역할",
    "category_name": "일반",
    "tags": ["태그1", "태그2"]
  }'
```

### 5. Swagger 문서 로딩 실패
**원인**: 서버 시작 전에 접속하거나 캐시 문제
```bash
# 해결 방법
1. 서버가 완전히 시작될 때까지 대기 (30초)
2. 브라우저 캐시 클리어 (Ctrl+F5)
3. 시크릿 모드로 접속
4. JSON 문서 직접 확인: http://localhost:4000/api-docs.json
```

---

## 💾 데이터베이스 문제

### 데이터베이스 완전 초기화
```bash
# 1. 현재 연결 끊기
psql -d prompt_db -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'prompt_db';"

# 2. 데이터베이스 삭제 및 재생성
dropdb prompt_db
createdb prompt_db

# 3. 스키마 및 데이터 재생성
cd backend
npm run migrate
npm run init-data
```

### 스키마 변경 후 문제
```bash
# 개발 중 스키마 변경 시
1. ALTER TABLE 명령으로 점진적 변경 (권장)
2. 또는 전체 재생성: npm run db-reset
```

### 테스트 데이터 문제
```bash
# 초기 데이터만 다시 로드
npm run init-data

# 특정 테이블 데이터 확인
psql -d prompt_db -c "SELECT * FROM ai_providers LIMIT 5;"
psql -d prompt_db -c "SELECT COUNT(*) FROM prompt_templates;"
```

---

## 🔍 디버깅 방법

### API 응답 디버깅
```bash
# 1. 서버 로그 확인 (개발 모드에서 자동)
npm run dev

# 2. 개별 API 테스트
curl -v http://localhost:4000/ping
curl -v http://localhost:4000/templates?page=1&limit=5

# 3. 상세 에러 확인
curl -X POST http://localhost:4000/templates \
  -H "Content-Type: application/json" \
  -d '잘못된JSON' \
  -w "\nStatus: %{http_code}\n"
```

### 데이터베이스 쿼리 디버깅
```sql
-- 1. 템플릿 개수 확인
SELECT COUNT(*) FROM prompt_templates;

-- 2. 최근 생성된 템플릿
SELECT id, title, created_at FROM prompt_templates 
ORDER BY created_at DESC LIMIT 5;

-- 3. AI 모델 목록 확인
SELECT p.name, m.name, m.is_available 
FROM ai_providers p 
JOIN ai_models m ON p.id = m.provider_id;

-- 4. 추천 규칙 확인
SELECT * FROM recommendation_rules ORDER BY priority DESC;
```

---

## ⚡ 성능 문제

### API 응답 속도 느림
```bash
# 1. 데이터베이스 인덱스 확인
psql -d prompt_db -c "\d+ prompt_templates"

# 2. 쿼리 실행 계획 확인
psql -d prompt_db -c "EXPLAIN ANALYZE SELECT * FROM prompt_templates WHERE category_id = 1;"

# 3. 연결 풀 모니터링 (향후 개선)
# TODO: pg-pool 로깅 추가
```

### 메모리 사용량 증가
```bash
# Node.js 메모리 사용량 확인
node --inspect src/index.ts
# Chrome DevTools에서 메모리 프로파일링

# 또는 htop/Task Manager로 모니터링
```

---

## 🔒 보안 문제

### SQL Injection 방지
```typescript
// ❌ 잘못된 방법
const query = `SELECT * FROM templates WHERE id = ${userId}`;

// ✅ 올바른 방법 (현재 구현)
const query = 'SELECT * FROM templates WHERE id = $1';
const result = await client.query(query, [userId]);
```

### 환경변수 누출 방지
```bash
# .env 파일이 git에 커밋되지 않도록 확인
git status
# .env가 나타나면 즉시 .gitignore에 추가
echo ".env" >> .gitignore
```

---

## 🧪 테스트 실패 해결

### testTemplateApi.ts 실패
```bash
# 1. 서버가 실행 중인지 확인
curl http://localhost:4000/ping

# 2. 데이터베이스 상태 확인
npm run test-schema

# 3. 테스트 재실행
npm run test-templates

# 4. 수동으로 한 단계씩 테스트
curl -X GET http://localhost:4000/templates
curl -X POST http://localhost:4000/templates -H "Content-Type: application/json" -d '{...}'
```

### testSchema.ts 실패
```bash
# 스키마 문제일 가능성
cd backend
npm run migrate
npm run test-schema
```

---

## 📱 환경별 문제

### Windows 환경
```bash
# PowerShell 권한 문제
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 긴 파일 경로 문제
git config --system core.longpaths true

# 줄바꿈 문제
git config --global core.autocrlf true
```

### macOS 환경  
```bash
# Homebrew PostgreSQL 문제
brew services restart postgresql
brew upgrade postgresql

# Node.js 권한 문제
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Linux 환경
```bash
# PostgreSQL 설치 및 설정
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Node.js 설치 (Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 🚀 배포 관련 문제

### 프로덕션 빌드
```bash
# TypeScript 컴파일
npm run build

# 빌드 결과 확인
ls -la dist/

# 프로덕션 모드 실행
NODE_ENV=production npm start
```

### 환경변수 설정
```bash
# 프로덕션 환경변수 체크리스트
✅ DATABASE_URL 설정
✅ NODE_ENV=production
✅ API 키들 설정 (T-003 후)
✅ 포트 설정
```

---

## 📞 추가 도움이 필요할 때

### 1. 로그 수집
```bash
# 서버 로그 저장
npm run dev > server.log 2>&1

# 데이터베이스 로그 (PostgreSQL 설정 필요)
tail -f /var/log/postgresql/postgresql-14-main.log
```

### 2. 시스템 정보 수집
```bash
# Node.js 버전
node --version
npm --version

# 데이터베이스 버전
psql --version

# 운영체제 정보
uname -a              # macOS/Linux
systeminfo            # Windows
```

### 3. GitHub Issues에 보고 시 포함할 정보
- 문제 재현 단계
- 예상 결과 vs 실제 결과  
- 환경 정보 (OS, Node.js 버전)
- 에러 메시지 전체
- 관련 로그 파일

---

## 📋 체크리스트

### 새로운 개발자 온보딩 시
```bash
□ PostgreSQL 설치 및 실행
□ Node.js 18+ 설치
□ Git 설정
□ 저장소 클론
□ npm install 실행
□ .env 파일 생성
□ 데이터베이스 생성
□ npm run db-reset 실행
□ npm run dev 실행
□ http://localhost:4000/ping 접속 확인
□ http://localhost:4000/api-docs 확인
□ npm run test-templates 실행
```

### 문제 발생 시 체크리스트
```bash
□ 서버가 실행 중인가?
□ 데이터베이스가 연결되어 있는가?
□ .env 파일이 올바르게 설정되어 있는가?
□ npm install이 완료되었는가?
□ 스키마가 최신 상태인가?
□ 포트 충돌이 없는가?
□ 방화벽이나 보안 소프트웨어가 차단하고 있지 않은가?
```

---

*마지막 업데이트: 2025-06-16* 