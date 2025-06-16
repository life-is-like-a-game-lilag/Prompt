import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AccessibilityProvider from './components/AccessibilityProvider';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "✨ 프롬프트 작성기 - AI 모델 추천 플랫폼",
  description: "효과적인 AI 프롬프트를 작성하고 관리하세요. 맞춤형 AI 모델 추천으로 당신의 창의성을 극대화하세요.",
  keywords: ["AI", "프롬프트", "작성기", "모델 추천", "OpenAI", "GPT", "Claude", "접근성", "웹접근성"],
  authors: [{ name: "AI Development Team" }],
  openGraph: {
    title: "✨ 프롬프트 작성기",
    description: "효과적인 AI 프롬프트 작성 및 맞춤형 AI 모델 추천",
    type: "website",
  },
  other: {
    // 접근성 관련 메타데이터
    'color-scheme': 'light dark',
    'theme-color': '#3b82f6',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <link rel="icon" href="🤖" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen`}
      >
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </body>
    </html>
  );
}
