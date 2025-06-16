import { pool } from './db';

const createAiModelsTableSQL = `
CREATE TABLE IF NOT EXISTS ai_models (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  description TEXT,
  strengths TEXT[],
  use_cases TEXT[],
  pricing_tier VARCHAR(50),
  api_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createRecommendationRulesSQL = `
CREATE TABLE IF NOT EXISTS recommendation_rules (
  id SERIAL PRIMARY KEY,
  keywords TEXT[],
  purpose_category VARCHAR(100),
  recommended_models INTEGER[],
  confidence_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const insertAiModelsSQL = `
INSERT INTO ai_models (name, provider, description, strengths, use_cases, pricing_tier, api_available) VALUES
('GPT-4', 'OpenAI', '가장 고성능의 범용 AI 모델', ARRAY['창작', '분석', '코딩', '논리적 사고'], ARRAY['복잡한 문제 해결', '창의적 글쓰기', '코드 생성'], 'premium', true),
('GPT-3.5 Turbo', 'OpenAI', '빠르고 비용 효율적인 AI 모델', ARRAY['빠른 응답', '비용 효율성'], ARRAY['일반적인 질답', '간단한 작업'], 'standard', true),
('Claude 3', 'Anthropic', '안전하고 도움이 되는 AI 어시스턴트', ARRAY['안전성', '긴 문맥 이해'], ARRAY['문서 분석', '안전한 대화'], 'premium', true),
('Gemini Pro', 'Google', '구글의 최신 AI 모델', ARRAY['다중 모달', '검색 연동'], ARRAY['이미지 분석', '실시간 정보'], 'standard', true),
('Claude Instant', 'Anthropic', '빠른 응답의 Claude 모델', ARRAY['빠른 처리', '비용 효율성'], ARRAY['일상적인 작업', '간단한 분석'], 'basic', true)
ON CONFLICT DO NOTHING;
`;

const insertRecommendationRulesSQL = `
INSERT INTO recommendation_rules (keywords, purpose_category, recommended_models, confidence_score) VALUES
(ARRAY['글쓰기', '창작', '소설', '시'], 'creative_writing', ARRAY[1, 3], 90),
(ARRAY['코딩', '프로그래밍', '개발', '코드'], 'programming', ARRAY[1, 2], 95),
(ARRAY['분석', '데이터', '리포트', '보고서'], 'analysis', ARRAY[1, 3], 85),
(ARRAY['번역', '언어', '외국어'], 'translation', ARRAY[1, 3, 4], 80),
(ARRAY['빠른', '간단한', '기본적인'], 'simple_tasks', ARRAY[2, 5], 75),
(ARRAY['복잡한', '어려운', '고급'], 'complex_tasks', ARRAY[1, 3], 90),
(ARRAY['이미지', '사진', '그림', '시각'], 'visual', ARRAY[4], 95),
(ARRAY['실시간', '최신', '뉴스'], 'realtime', ARRAY[4], 85)
ON CONFLICT DO NOTHING;
`;

async function initAiData() {
  try {
    // 테이블 생성
    await pool.query(createAiModelsTableSQL);
    console.log('✅ ai_models 테이블이 생성되었습니다.');
    
    await pool.query(createRecommendationRulesSQL);
    console.log('✅ recommendation_rules 테이블이 생성되었습니다.');
    
    // 기본 데이터 삽입
    await pool.query(insertAiModelsSQL);
    console.log('✅ AI 모델 기본 데이터가 삽입되었습니다.');
    
    await pool.query(insertRecommendationRulesSQL);
    console.log('✅ 추천 규칙 기본 데이터가 삽입되었습니다.');
    
  } catch (err) {
    console.error('❌ AI 데이터 초기화 실패:', err);
  } finally {
    await pool.end();
  }
}

initAiData(); 