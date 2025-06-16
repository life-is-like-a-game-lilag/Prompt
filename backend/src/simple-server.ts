import express from 'express';
import cors from 'cors';
import { sendSuccessResponse, sendErrorResponse } from './utils/response';
import { QuestionResponse, CompletedResponse, AIRecommendationResponse, HealthCheckResponse } from './types/response';

const app = express();
const PORT = 4000;

// 기본 미들웨어
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  sendSuccessResponse(res, 
    { status: 'OK' }, 
    '🎯 간단한 백엔드 서버 작동 중!', 
    200
  );
});

// 헬스체크
app.get('/health', (req, res) => {
  const healthData: HealthCheckResponse = {
    status: 'OK',
    uptime: process.uptime(),
    memory_usage: {
      used: process.memoryUsage().heapUsed / 1024 / 1024,
      free: process.memoryUsage().heapTotal / 1024 / 1024 - process.memoryUsage().heapUsed / 1024 / 1024,
      total: process.memoryUsage().heapTotal / 1024 / 1024
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  sendSuccessResponse(res, healthData, '서버가 정상 작동 중입니다!', 200);
});

// 추천 API (간단 버전)
app.post('/recommend/questions', (req, res) => {
  try {
    const { step = 1 } = req.body;
    
    const questions = [
      {
        step: 1,
        question: "어떤 목적으로 AI를 사용하고 싶으신가요?",
        options: [
          { value: "writing", label: "글쓰기/창작" },
          { value: "coding", label: "프로그래밍/개발" },
          { value: "analysis", label: "데이터 분석/리포트" },
          { value: "translation", label: "번역" },
          { value: "visual", label: "이미지/시각 작업" },
          { value: "general", label: "일반적인 질답" }
        ]
      },
      {
        step: 2,
        question: "작업의 복잡도는 어느 정도인가요?",
        options: [
          { value: "simple", label: "간단함 (빠른 답변 필요)" },
          { value: "medium", label: "보통 (일반적인 작업)" },
          { value: "complex", label: "복잡함 (고급 분석/창작)" }
        ]
      },
      {
        step: 3,
        question: "비용과 성능 중 무엇이 더 중요한가요?",
        options: [
          { value: "cost", label: "비용 효율성" },
          { value: "performance", label: "최고 성능" },
          { value: "balanced", label: "균형 잡힌 선택" }
        ]
      }
    ];

    if (step <= questions.length) {
      const questionData: QuestionResponse = {
        current_question: questions[step - 1],
        total_steps: questions.length,
        progress: (step / questions.length) * 100
      };
      
      sendSuccessResponse(res, questionData, `${step}단계 질문을 생성했습니다.`, 200);
    } else {
      const completedData: CompletedResponse = {
        completed: true,
        message: "질문이 완료되었습니다. AI 추천을 진행합니다."
      };
      
      sendSuccessResponse(res, completedData, "모든 질문이 완료되었습니다.", 200);
    }
  } catch (error) {
    sendErrorResponse(res, 'QUESTION_GENERATION_ERROR', '질문 생성 중 오류가 발생했습니다.', 500, error);
  }
});

// AI 모델 추천 API (Mock 데이터)
app.post('/recommend/ai-models', (req, res) => {
  try {
    const { keywords } = req.body;
    
    const mockRecommendations = [
      {
        id: 1,
        name: 'GPT-4',
        provider_company: 'OpenAI',
        description: '고급 언어 모델로 복잡한 작업에 최적화',
        pricing_tier: 'premium',
        performance_score: 95
      },
      {
        id: 2,
        name: 'Claude-3',
        provider_company: 'Anthropic',
        description: '안전하고 정확한 정보 제공에 특화',
        pricing_tier: 'premium',
        performance_score: 90
      },
      {
        id: 3,
        name: 'Gemini Pro',
        provider_company: 'Google',
        description: '다양한 형태의 콘텐츠 생성 가능',
        pricing_tier: 'standard',
        performance_score: 85
      }
    ];

    const recommendationData: AIRecommendationResponse = {
      recommendations: mockRecommendations,
      match_reason: '범용 추천',
      confidence: 85,
      matched_keywords: keywords || []
    };

    sendSuccessResponse(res, recommendationData, `${mockRecommendations.length}개의 AI 모델을 추천했습니다.`, 200);
  } catch (error) {
    sendErrorResponse(res, 'AI_RECOMMENDATION_ERROR', 'AI 모델 추천 중 오류가 발생했습니다.', 500, error);
  }
});

// 전역 에러 처리 미들웨어
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('전역 에러:', error);
  
  sendErrorResponse(
    res,
    'INTERNAL_SERVER_ERROR',
    '서버에서 예상치 못한 오류가 발생했습니다.',
    500,
    process.env.NODE_ENV === 'development' ? error.stack : undefined
  );
});

// 404 핸들러
app.use((req, res) => {
  sendErrorResponse(
    res,
    'NOT_FOUND',
    `경로 '${req.originalUrl}'를 찾을 수 없습니다.`,
    404
  );
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 간단한 백엔드 서버 시작됨!`);
  console.log(`📍 서버 주소: http://localhost:${PORT}`);
  console.log(`💚 헬스체크: http://localhost:${PORT}/health`);
  console.log(`🤖 추천 API: http://localhost:${PORT}/recommend/questions`);
});

export default app; 