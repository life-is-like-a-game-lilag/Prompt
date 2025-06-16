/**
 * 🎯 AI 모델 추천 엔진 - 스마트 매칭 시스템
 * 
 * 사용자의 요구사항을 분석하여 최적의 AI 모델을 추천하는 핵심 모듈입니다.
 * 다단계 질문과 키워드 분석을 통해 개인화된 추천을 제공합니다.
 * 
 * 주요 기능:
 * - 다단계 대화형 AI 모델 추천
 * - 키워드 기반 스마트 매칭 알고리즘
 * - 용도별/복잡도별/비용별 최적화 추천
 * - 신뢰도 점수 기반 추천 품질 평가
 * - 전체 AI 모델 카탈로그 제공
 * 
 * 추천 알고리즘 구조:
 * 1. 목적 분석 (writing, coding, analysis, translation, visual, general)
 * 2. 복잡도 평가 (simple, medium, complex)
 * 3. 우선순위 결정 (cost, performance, balanced)
 * 4. 매칭 규칙 적용 및 신뢰도 계산
 * 5. 최종 추천 목록 생성
 * 
 * 지원하는 사용 케이스:
 * - 텍스트 생성 및 창작
 * - 코딩 및 프로그래밍 지원
 * - 데이터 분석 및 리포트 작성
 * - 다국어 번역
 * - 이미지 생성 및 편집
 * - 일반적인 질의응답
 * 
 * API 엔드포인트:
 * - POST /recommend/ai-models : AI 모델 추천 (키워드 기반)
 * - POST /recommend/questions : 대화형 질문 생성
 * - GET /recommend/ai-models  : 전체 AI 모델 목록
 * 
 * @author 프롬프트 작성기 팀
 * @version 3.1 (경로 및 에러 처리 개선)
 * @since 2025-06-16
 */

import express from 'express';
import { logger } from '../utils/logger';
import { pool } from '../db';

const router = express.Router();

// 요청 검증 미들웨어
const validateRecommendRequest = (req: any, res: any, next: any) => {
  const { keywords } = req.body;
  
  if (keywords && (!Array.isArray(keywords) || keywords.length > 3)) {
    return res.status(400).json({
      success: false,
      error: '키워드는 최대 3개까지 배열 형태로 전달해주세요.'
    });
  }
  
  next();
};

// API 응답 표준화 헬퍼
const createSuccessResponse = (data: any, message?: string) => ({
  success: true,
  data,
  message: message || 'Success',
  timestamp: new Date().toISOString()
});

const createErrorResponse = (error: string, details?: any) => ({
  success: false,
  error,
  details,
  timestamp: new Date().toISOString()
});

router.get('/', (req, res) => {
  logger.info('추천 API 기본 요청');
  res.json(createSuccessResponse({
    version: '3.1',
    endpoints: [
      'POST /recommend/ai-models - AI 모델 추천',
      'POST /recommend/questions - 대화형 질문 생성',
      'GET /recommend/ai-models - 전체 AI 모델 목록'
    ]
  }, '추천 API 서비스가 정상 작동 중입니다.'));
});

/**
 * 🔮 AI 모델 스마트 추천 API
 * POST /recommend/ai-models
 * 
 * 사용자의 키워드와 요구사항을 분석하여 최적의 AI 모델을 추천합니다.
 * 
 * 요청 바디:
 * {
 *   "requirements": "사용자 요구사항 텍스트 (선택)",
 *   "keywords": ["목적", "복잡도", "우선순위"] // 3단계 질문 답변
 * }
 * 
 * 키워드 매칭 규칙:
 * - keywords[0]: 목적 (writing, coding, analysis, translation, visual, general)
 * - keywords[1]: 복잡도 (simple, medium, complex)
 * - keywords[2]: 우선순위 (cost, performance, balanced)
 * 
 * 추천 로직:
 * 1. writing + complex/performance → GPT-4, Claude 3 (신뢰도 90%)
 * 2. coding + complex/performance → GPT-4, Gemini Pro (신뢰도 95%)
 * 3. analysis + complex → GPT-4, Claude 3, Gemini (신뢰도 90%)
 * 4. visual + cost → Stable Diffusion (신뢰도 90%)
 * 5. visual + performance → DALL-E 3, Midjourney (신뢰도 95%)
 * 6. 매칭 실패 시 → 범용 모델 추천 (신뢰도 60%)
 * 
 * 응답 형식:
 * {
 *   "success": true,
 *   "data": {
 *     "recommendations": [...], // 추천 모델 목록
 *     "match_reason": "고급 텍스트 생성",
 *     "confidence": 90,
 *     "matched_keywords": ["writing", "complex", "performance"]
 *   }
 * }
 */
router.post('/ai-models', validateRecommendRequest, async (req: any, res: any) => {
  const { requirements, keywords } = req.body;
  
  try {
    logger.info('AI 모델 추천 요청', { 
      context: { keywords, requirements: requirements?.substring(0, 100) } 
    });
    
    // 개선된 키워드 매칭 로직
    let matchedRule = null;
    
    // 키워드가 있는 경우 매칭 시도
    if (keywords && keywords.length > 0) {
      // 목적별 추천
      const purpose = keywords[0]; // 첫 번째 답변 (목적)
      const complexity = keywords[1]; // 두 번째 답변 (복잡도)
      const priority = keywords[2]; // 세 번째 답변 (비용/성능)
      
      if (purpose === 'writing') {
        if (complexity === 'complex' || priority === 'performance') {
          matchedRule = { purpose_category: '고급 텍스트 생성', confidence_score: 90, recommended_models: [1, 3] };
        } else {
          matchedRule = { purpose_category: '일반 텍스트 생성', confidence_score: 85, recommended_models: [2] };
        }
      } else if (purpose === 'coding') {
        if (complexity === 'complex' || priority === 'performance') {
          matchedRule = { purpose_category: '고급 코딩 지원', confidence_score: 95, recommended_models: [1, 4] };
        } else {
          matchedRule = { purpose_category: '일반 코딩 지원', confidence_score: 80, recommended_models: [2, 1] };
        }
      } else if (purpose === 'analysis') {
        if (complexity === 'complex') {
          matchedRule = { purpose_category: '고급 데이터 분석', confidence_score: 90, recommended_models: [1, 3, 4] };
        } else {
          matchedRule = { purpose_category: '기본 데이터 분석', confidence_score: 75, recommended_models: [2, 4] };
        }
      } else if (purpose === 'translation') {
        matchedRule = { purpose_category: '번역', confidence_score: 85, recommended_models: [1, 3, 4] };
      } else if (purpose === 'visual') {
        if (priority === 'cost') {
          matchedRule = { purpose_category: '경제적 이미지 생성', confidence_score: 90, recommended_models: [7] };
        } else {
          matchedRule = { purpose_category: '고품질 이미지 생성', confidence_score: 95, recommended_models: [5, 6] };
        }
      } else if (purpose === 'general') {
        if (priority === 'cost') {
          matchedRule = { purpose_category: '경제적 범용 AI', confidence_score: 75, recommended_models: [2] };
        } else {
          matchedRule = { purpose_category: '고성능 범용 AI', confidence_score: 85, recommended_models: [1, 3] };
        }
      }
    }
    
    // 매칭된 규칙이 없으면 범용 모델 추천
    if (!matchedRule) {
      const fallbackQuery = `
        SELECT m.*, p.name as provider_name, p.company as provider_company
        FROM ai_models m
        JOIN ai_providers p ON m.provider_id = p.id
        WHERE m.pricing_tier IN ('standard', 'premium') AND m.is_active = true
        ORDER BY 
          CASE WHEN m.name LIKE '%GPT-4%' THEN 1
               WHEN m.name LIKE '%Claude%' THEN 2
               ELSE 3 END
        LIMIT 3
      `;
      const fallbackResult = await pool.query(fallbackQuery);
      
      return res.json(createSuccessResponse({
        recommendations: fallbackResult.rows,
        match_reason: '범용 추천',
        confidence: 60,
        matched_keywords: keywords || []
      }, '범용 AI 모델을 추천했습니다.'));
    }
    
    // 추천된 모델들 상세 정보 조회 (제공업체 정보 포함)
    const modelsQuery = `
      SELECT m.*, p.name as provider_name, p.company as provider_company, p.website_url as provider_website
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE m.id = ANY($1) AND m.is_active = true
      ORDER BY 
        CASE WHEN m.pricing_tier = 'premium' THEN 1
             WHEN m.pricing_tier = 'standard' THEN 2
             ELSE 3 END,
        m.performance_score DESC
    `;
    const modelsResult = await pool.query(modelsQuery, [matchedRule.recommended_models]);
    
    logger.info('AI 모델 추천 성공', { 
      context: { 
        count: modelsResult.rows.length,
        confidence: matchedRule.confidence_score,
        category: matchedRule.purpose_category
      } 
    });
    
    res.json(createSuccessResponse({
      recommendations: modelsResult.rows,
      match_reason: matchedRule.purpose_category,
      confidence: matchedRule.confidence_score,
      matched_keywords: keywords
    }, `${matchedRule.purpose_category} 용도로 ${modelsResult.rows.length}개 모델을 추천했습니다.`));
    
  } catch (err) {
    logger.error('AI 모델 추천 실패', err as Error);
    console.error('추천 API 에러:', err);
    res.status(500).json(createErrorResponse(
      '서버 내부 오류가 발생했습니다.',
      process.env.NODE_ENV === 'development' ? String(err) : undefined
    ));
  }
});

/**
 * ❓ 대화형 질문 생성 API
 * POST /recommend/questions
 * 
 * 사용자 맞춤 AI 추천을 위한 3단계 질문을 순차적으로 제공합니다.
 * 
 * 요청 바디:
 * {
 *   "initial_input": "사용자 초기 입력 (선택)",
 *   "step": 1 // 현재 질문 단계 (1-3)
 * }
 * 
 * 질문 구조:
 * 1단계: 목적 선택 (글쓰기, 코딩, 분석, 번역, 이미지, 일반)
 * 2단계: 복잡도 선택 (간단, 보통, 복잡)
 * 3단계: 우선순위 선택 (비용, 성능, 균형)
 * 
 * 응답 형식:
 * {
 *   "success": true,
 *   "data": {
 *     "current_question": {
 *       "step": 1,
 *       "question": "어떤 목적으로 AI를 사용하고 싶으신가요?",
 *       "options": [...]
 *     },
 *     "total_steps": 3,
 *     "progress": 33.33
 *   }
 * }
 */
router.post('/questions', async (req: any, res: any) => {
  const { initial_input, step = 1 } = req.body;
  
  try {
    logger.info('대화형 질문 요청', { context: { step, initial_input } });
    
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
    
    if (step < 1 || step > questions.length) {
      return res.status(400).json(createErrorResponse(
        `유효하지 않은 단계입니다. 1-${questions.length} 사이의 값을 입력해주세요.`
      ));
    }
    
    if (step <= questions.length) {
      res.json(createSuccessResponse({
        current_question: questions[step - 1],
        total_steps: questions.length,
        progress: (step / questions.length) * 100
      }, `${step}단계 질문을 생성했습니다.`));
    } else {
      res.json(createSuccessResponse({
        completed: true,
        message: "질문이 완료되었습니다. AI 추천을 진행합니다."
      }, '모든 질문이 완료되었습니다.'));
    }
    
  } catch (err) {
    logger.error('대화형 질문 생성 실패', err as Error);
    res.status(500).json(createErrorResponse('질문 생성 중 오류가 발생했습니다.'));
  }
});

/**
 * 📋 전체 AI 모델 카탈로그 API
 * GET /recommend/ai-models
 * 
 * 시스템에 등록된 모든 AI 모델의 상세 정보를 제공합니다.
 * 제공업체 정보와 함께 성능 순으로 정렬되어 제공됩니다.
 * 
 * 응답에 포함되는 정보:
 * - 모델 기본 정보 (이름, 설명, 버전)
 * - 제공업체 정보 (회사명, 웹사이트)
 * - 성능 지표 (성능 점수, 가격 티어)
 * - 기술 사양 (최대 토큰, 지원 기능)
 * 
 * 정렬 순서:
 * 1. 가격 티어 (premium → standard → others)
 * 2. 성능 점수 (높은 순)
 * 3. 모델명 (알파벳 순)
 */
router.get('/ai-models', async (_req: any, res: any) => {
  try {
    logger.info('전체 AI 모델 목록 요청');
    
    const result = await pool.query(`
      SELECT 
        m.*,
        p.name as provider_name,
        p.company as provider_company,
        p.website_url as provider_website
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE m.is_active = true
      ORDER BY 
        CASE WHEN m.pricing_tier = 'premium' THEN 1
             WHEN m.pricing_tier = 'standard' THEN 2
             ELSE 3 END,
        m.performance_score DESC,
        m.name
    `);
    
    logger.info('AI 모델 목록 조회 성공', { context: { count: result.rows.length } });
    
    res.json(createSuccessResponse(
      result.rows,
      `총 ${result.rows.length}개의 AI 모델을 조회했습니다.`
    ));
    
  } catch (err) {
    logger.error('AI 모델 목록 조회 실패', err as Error);
    res.status(500).json(createErrorResponse('AI 모델 목록을 불러오는 중 오류가 발생했습니다.'));
  }
});

/**
 * 📂 카테고리 목록 조회 API
 * GET /recommend/categories
 * 
 * 프롬프트 템플릿 분류를 위한 모든 활성 카테고리를 조회합니다.
 * 정렬 순서와 이름 순으로 정렬되어 반환됩니다.
 * 
 * 정렬 기준:
 * 1. sort_order (우선순위 기준)
 * 2. 카테고리명 (알파벳 순)
 * 
 * 용도:
 * - 템플릿 생성 시 카테고리 선택
 * - 템플릿 필터링 및 분류
 * - 카테고리별 템플릿 통계 생성
 * 
 * 응답 필드:
 * - id: 카테고리 고유 ID
 * - name: 카테고리명
 * - description: 카테고리 설명
 * - sort_order: 정렬 순서
 * - is_active: 활성화 상태
 */
router.get('/categories', async (_req: any, res: any) => {
  try {
    const result = await pool.query(`
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY sort_order, name
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * 🏷️ 태그 목록 조회 API
 * GET /recommend/tags
 * 
 * 프롬프트 템플릿에 사용할 수 있는 모든 태그 목록을 제공합니다.
 * 사용 빈도가 높은 태그부터 우선적으로 표시됩니다.
 * 
 * 정렬 기준:
 * 1. usage_count (사용 횟수, 높은 순)
 * 2. 태그명 (알파벳 순)
 * 
 * 용도:
 * - 템플릿 생성 시 태그 선택 도움
 * - 인기 태그 파악
 * - 태그 기반 템플릿 검색
 * - 템플릿 분류 개선
 * 
 * 응답 필드:
 * - id: 태그 고유 ID
 * - name: 태그명
 * - description: 태그 설명
 * - usage_count: 사용 횟수
 * - created_at: 생성일
 */
router.get('/tags', async (_req: any, res: any) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tags 
      ORDER BY usage_count DESC, name
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * 🔍 특정 AI 모델 상세 정보 조회 API
 * GET /recommend/ai-models/:id
 * 
 * 특정 AI 모델의 완전한 상세 정보를 제공합니다.
 * 제공업체 정보와 API 연동 정보까지 포함된 전체 데이터를 반환합니다.
 * 
 * 경로 파라미터:
 * - id: 조회할 AI 모델의 고유 ID
 * 
 * 응답에 포함되는 정보:
 * - 모델 기본 정보 (이름, 설명, 버전, 성능 점수)
 * - 기술 사양 (최대 토큰, 지원 기능, 가격 정보)
 * - 제공업체 완전 정보 (회사명, 웹사이트, API 베이스 URL)
 * - 활성화 상태 및 사용 가능 여부
 * 
 * 활용 방안:
 * - 모델 비교 페이지에서 상세 정보 표시
 * - API 연동을 위한 기술 사양 확인
 * - 사용자에게 모델 선택 도움 제공
 * - 모델별 가격 및 성능 정보 제공
 * 
 * 에러 처리:
 * - 404: 모델을 찾을 수 없거나 비활성화 상태
 * - 500: 데이터베이스 연결 오류
 */
router.get('/ai-models/:id', async (req: any, res: any) => {
  const { id } = req.params;
  
  try {
    if (!id || isNaN(Number(id))) {
      return res.status(400).json(createErrorResponse('유효한 모델 ID를 입력해주세요.'));
    }
    
    logger.info('AI 모델 상세 정보 요청', { context: { modelId: id } });
    
    const result = await pool.query(`
      SELECT 
        m.*,
        p.name as provider_name,
        p.company as provider_company,
        p.website_url as provider_website,
        p.api_base_url as provider_api_base
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE m.id = $1 AND m.is_active = true
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse(
        'AI 모델을 찾을 수 없습니다.',
        { modelId: id }
      ));
    }
    
    logger.info('AI 모델 상세 정보 조회 성공', { context: { modelId: id, modelName: result.rows[0].name } });
    
    res.json(createSuccessResponse(
      result.rows[0],
      `${result.rows[0].name} 모델 정보를 조회했습니다.`
    ));
    
  } catch (err) {
    logger.error('AI 모델 상세 정보 조회 실패', err as Error);
    res.status(500).json(createErrorResponse('모델 정보를 불러오는 중 오류가 발생했습니다.'));
  }
});

export default router; 