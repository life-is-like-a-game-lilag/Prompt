# 백엔드(Express + TypeScript)

## 프로젝트 개요
- Node.js(Express) 기반 API 서버
- TypeScript 적용
- PostgreSQL 연동 예정

## 폴더 구조
```
prompt/
  backend/    # 백엔드 서버
    src/      # 소스 코드
      index.ts  # 서버 진입점
```

## 실행 방법
1. 개발 서버 실행
   ```bash
   npx nodemon src/index.ts
   ```
   - 서버가 4000번 포트에서 실행됨
   - http://localhost:4000 접속 시 "Backend API is running" 확인

2. TypeScript 빌드
   ```bash
   npx tsc
   ```

## 주요 명령어
- `npx nodemon src/index.ts` : 개발 서버(자동 재시작)
- `npx tsc` : TypeScript 빌드

## 협업/개발 참고
- 환경 변수(.env)는 git에 올리지 않음
- 코드 수정 시 커밋 메시지에 변경 내역 명확히 작성
- 추가 문의/가이드 필요시 AI에게 요청 