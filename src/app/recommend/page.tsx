'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';
import ProgressBar from '../components/ProgressBar';

interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIModel {
  id: number;
  name: string;
  provider_name: string;
  provider_company: string;
  description: string;
  pricing_tier: string;
  performance_score: number;
}

interface RecommendationResult {
  recommendations: AIModel[];
  match_reason: string;
  confidence: number;
  matched_keywords: string[];
}

interface Question {
  step: number;
  question: string;
  options: Array<{ value: string; label: string }>;
}

export default function RecommendPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'ai',
      content: '안녕하세요! 🤖 어떤 작업을 도와드릴까요? 첫 번째 질문부터 시작하겠습니다.',
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 첫 번째 질문 로드
  const loadFirstQuestion = async () => {
    if (step === 0) {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:4000/recommend/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: 1 })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setCurrentQuestion(result.data.current_question);
          setStep(1);
          
          const aiMessage: ChatMessage = {
            id: messages.length + 1,
            type: 'ai',
            content: result.data.current_question.question,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          setError('질문을 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError('서버 연결에 실패했습니다.');
        console.error('질문 로드 실패:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 답변 선택 처리
  const handleAnswerSelect = async (answer: string) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 사용자 답변 메시지 추가
      const userMessage: ChatMessage = {
        id: messages.length + 1,
        type: 'user',
        content: currentQuestion?.options.find(opt => opt.value === answer)?.label || answer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);
      
      if (step < 3) {
        // 다음 질문 요청
        const response = await fetch('http://localhost:4000/recommend/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: step + 1 })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setCurrentQuestion(result.data.current_question);
          setStep(step + 1);
          
          const aiMessage: ChatMessage = {
            id: messages.length + 2,
            type: 'ai',
            content: result.data.current_question.question,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          setError('다음 질문을 불러오는데 실패했습니다.');
        }
      } else {
        // 3단계 완료 - AI 추천 요청
        const recommendResponse = await fetch('http://localhost:4000/recommend/ai-models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: newAnswers })
        });
        
        const recommendResult = await recommendResponse.json();
        
        if (recommendResult.success) {
          setRecommendation(recommendResult.data);
          setCurrentQuestion(null);
          
          const aiMessage: ChatMessage = {
            id: messages.length + 2,
            type: 'ai',
            content: `완벽합니다! 🎉 "${recommendResult.data.match_reason}" 용도로 ${recommendResult.data.recommendations.length}개의 AI 모델을 추천했습니다. (신뢰도: ${recommendResult.data.confidence}%)`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          setError('AI 추천을 받는데 실패했습니다.');
        }
      }
    } catch (err) {
      setError('처리 중 오류가 발생했습니다.');
      console.error('답변 처리 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 프롬프트 복사 기능
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('복사 실패:', err);
      alert('복사에 실패했습니다.');
    }
  };

  // 다시 시작
  const startOver = () => {
    setMessages([{
      id: 1,
      type: 'ai',
      content: '안녕하세요! 🤖 어떤 작업을 도와드릴까요? 첫 번째 질문부터 시작하겠습니다.',
      timestamp: new Date()
    }]);
    setStep(0);
    setAnswers([]);
    setCurrentQuestion(null);
    setRecommendation(null);
    setError(null);
    setCurrentInput('');
  };

  // 이전 단계로
  const goToPreviousStep = () => {
    if (step > 1) {
      const newStep = step - 1;
      const newAnswers = answers.slice(0, newStep - 1);
      setStep(newStep);
      setAnswers(newAnswers);
      setCurrentQuestion(null);
      setError(null);
      
      // 이전 질문 다시 로드
      loadPreviousQuestion(newStep);
    }
  };

  const loadPreviousQuestion = async (targetStep: number) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:4000/recommend/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: targetStep })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCurrentQuestion(result.data.current_question);
      }
    } catch (err) {
      setError('이전 질문을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark-bg light-bg transition-all duration-500">
      {/* 테마 토글 버튼 */}
      <ThemeToggle />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-6">
            <a
              href="/"
              className="group inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-all duration-300"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              홈으로 돌아가기
            </a>
          </div>
          <h1 className="text-6xl font-bold mb-6 flex items-center justify-center gap-4">
            <span className="emoji text-7xl">🤖</span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">AI 모델 추천</span>
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
          <p className="text-xl theme-text-secondary max-w-3xl mx-auto leading-relaxed">
            몇 가지 질문에 답하시면 <span className="font-semibold text-indigo-600">최적의 AI 모델</span>을 추천해드립니다
            <br />
            <span className="text-lg theme-text-secondary opacity-80">당신의 요구사항에 완벽하게 맞는 AI를 찾아보세요</span>
          </p>
          
          {/* 진행상황 표시 - 새로운 ProgressBar 컴포넌트 */}
          <div className="mt-12">
            <ProgressBar
              currentStep={Math.max(step, 0)}
              totalSteps={3}
              steps={[
                { label: '목적', description: '무엇을 위한 AI인가요?', icon: '🎯' },
                { label: '복잡도', description: '어느 정도 수준이 필요한가요?', icon: '⚙️' },
                { label: '우선순위', description: '가장 중요한 요소는 무엇인가요?', icon: '📊' }
              ]}
              variant="detailed"
              size="md"
              animated={true}
              showLabels={true}
              showPercentage={true}
            />
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-2xl p-6 mb-8 animate-slide-up">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-red-700 font-medium">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-600 text-sm hover:text-red-800 mt-1"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 시작 버튼 */}
        {step === 0 && !isLoading && (
          <div className="text-center mb-8">
            <div className="bg-blue-50 dark:bg-gray-800 rounded-3xl p-8 max-w-md mx-auto mb-8">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold theme-text-primary mb-2">AI 추천 여정을 시작해보세요!</h3>
              <p className="theme-text-secondary text-sm">3단계 질문으로 완벽한 AI를 찾아드립니다</p>
            </div>
            <button
              onClick={loadFirstQuestion}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl inline-flex items-center gap-3"
            >
              <span className="text-2xl group-hover:animate-bounce">🤖</span>
              <span>AI 추천 시작하기</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* 질문 영역 */}
        {currentQuestion && !recommendation && (
          <div className="theme-card shadow-3xl rounded-3xl p-8 mb-6 animate-slide-up">
            {/* 현재 단계 표시 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-4 bg-blue-50 dark:bg-gray-800 px-6 py-4 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg pulse-soft">
                  {step === 1 ? '🎯' : step === 2 ? '⚙️' : '📊'}
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg theme-text-primary">
                    {step === 1 ? '1단계: 목적 파악' : step === 2 ? '2단계: 복잡도 확인' : '3단계: 우선순위 설정'}
                  </div>
                  <div className="text-sm theme-text-secondary">
                    {step === 1 ? '어떤 용도로 AI를 사용하시나요?' : 
                     step === 2 ? '원하는 복잡도 수준을 알려주세요' : 
                     '가장 중요한 요소를 선택해주세요'}
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold theme-text-primary mb-8 text-center leading-relaxed">
              {currentQuestion.question}
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswerSelect(option.value)}
                  disabled={isLoading}
                  className="group option-card hover-lift-smooth p-6 theme-card rounded-2xl border-2 border-transparent hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-left transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold theme-text-primary text-base group-hover:text-blue-600 transition-colors">
                        {option.label}
                      </span>
                      {/* 옵션별 설명 추가 (선택사항) */}
                      <div className="text-sm theme-text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {step === 1 && index === 0 && '간단한 일상 업무나 개인적인 용도'}
                        {step === 1 && index === 1 && '전문적인 업무나 비즈니스 목적'}
                        {step === 2 && index === 0 && '누구나 쉽게 사용할 수 있는 수준'}
                        {step === 2 && index === 1 && '어느 정도 학습이 필요한 수준'}
                        {step === 3 && index === 0 && '빠른 속도와 효율성을 중시'}
                        {step === 3 && index === 1 && '높은 정확도와 품질을 중시'}
                      </div>
                    </div>
                    <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* 로딩 상태 표시 */}
            {isLoading && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 bg-blue-50 dark:bg-gray-800 px-6 py-4 rounded-2xl">
                  <div className="loading-dots">
                    <span className="bg-blue-600"></span>
                    <span className="bg-purple-600"></span>
                    <span className="bg-indigo-600"></span>
                  </div>
                  <span className="font-medium theme-text-primary">
                    {step < 3 ? '다음 질문을 준비 중...' : 'AI 추천을 분석 중...'}
                  </span>
                </div>
              </div>
            )}
            
            {/* 이전 버튼 */}
            {step > 1 && !isLoading && (
              <div className="text-center mt-8">
                <button
                  onClick={goToPreviousStep}
                  className="inline-flex items-center gap-2 theme-text-secondary hover:text-blue-600 font-medium transition-all duration-300 hover:gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  이전 질문으로 돌아가기
                </button>
              </div>
            )}
          </div>
        )}

        {/* 채팅 영역 */}
        <div className="theme-card shadow-3xl rounded-3xl p-6 mb-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-2xl max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="loading-dots">
                      <span className="bg-gray-600 dark:bg-gray-400"></span>
                      <span className="bg-gray-600 dark:bg-gray-400"></span>
                      <span className="bg-gray-600 dark:bg-gray-400"></span>
                    </div>
                    <span className="text-sm">AI가 생각 중...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 추천 결과 */}
        {recommendation && (
          <div className="theme-card shadow-3xl rounded-3xl p-8">
            {/* 완료된 프로그레스 바 */}
            <div className="mb-8">
              <ProgressBar
                currentStep={4}
                totalSteps={3}
                steps={[
                  { label: '목적', description: '무엇을 위한 AI인가요?', icon: '🎯' },
                  { label: '복잡도', description: '어느 정도 수준이 필요한가요?', icon: '⚙️' },
                  { label: '우선순위', description: '가장 중요한 요소는 무엇인가요?', icon: '📊' }
                ]}
                variant="minimal"
                size="sm"
                animated={true}
                showLabels={true}
                showPercentage={false}
              />
            </div>
            
            <h2 className="text-3xl font-bold theme-text-primary mb-6 text-center">
              🎯 맞춤 추천 결과
            </h2>
            
            <div className="text-center mb-8">
              <p className="text-lg theme-text-secondary mb-2">
                <span className="font-semibold text-blue-600">{recommendation.match_reason}</span> 용도로 추천
              </p>
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold text-green-800">추천 신뢰도:</span>
                <span className="font-bold text-green-700">{recommendation.confidence}%</span>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendation.recommendations.map((model, index) => (
                <div
                  key={model.id}
                  className="theme-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold theme-text-primary mb-2">{model.name}</h3>
                    <p className="text-sm theme-text-secondary font-medium">{model.provider_company}</p>
                  </div>
                  
                  <p className="theme-text-secondary text-sm mb-4">{model.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      model.pricing_tier === 'premium' 
                        ? 'bg-purple-100 text-purple-800' 
                        : model.pricing_tier === 'standard'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {model.pricing_tier === 'premium' ? '프리미엄' : 
                       model.pricing_tier === 'standard' ? '스탠다드' : '무료'}
                    </span>
                    <div className="text-sm theme-text-secondary">
                      성능: {model.performance_score}/100
                    </div>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(`AI 모델: ${model.name}\n제공업체: ${model.provider_company}\n설명: ${model.description}`)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    정보 복사하기
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startOver}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  다시 시작
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  홈으로 가기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 