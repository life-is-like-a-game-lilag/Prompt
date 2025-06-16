This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🇰🇷 프로젝트 실행 및 개발 가이드

### 폴더 구조
```
prompt/
  frontend/   # Next.js 프론트엔드
  backend/    # Express 백엔드
```

### 실행 방법
1. 프론트엔드 개발 서버 실행
   ```bash
   cd frontend
   npm run dev
   ```
   - 브라우저에서 http://localhost:3000 접속

2. 백엔드 개발 서버 실행
   ```bash
   cd ../backend
   npx nodemon src/index.ts
   ```
   - 브라우저에서 http://localhost:4000 접속(테스트용)

### 주요 명령어
- `npm run dev` : 프론트엔드 개발 서버 실행
- `npx nodemon src/index.ts` : 백엔드 개발 서버(자동 재시작)

### 협업/개발 참고
- 코드 수정 시 PR 또는 커밋 메시지에 변경 내역 명확히 작성
- 환경 변수(.env)는 git에 올리지 않음
- 추가 문의/가이드 필요시 AI에게 요청
