-- 프롬프트 작성기 완전한 DB 스키마
-- Created: 2025-06-16
-- Description: AI 추천, 프롬프트 템플릿, 사용자 피드백, 버전관리를 포함한 완전한 스키마

-- ===============================================
-- 1. AI 모델 관련 테이블들
-- ===============================================

-- AI 제공업체 테이블
CREATE TABLE IF NOT EXISTS ai_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    company VARCHAR(100) NOT NULL,
    website_url TEXT,
    api_base_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI 모델 테이블 (기존 개선)
DROP TABLE IF EXISTS ai_models CASCADE;
CREATE TABLE ai_models (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES ai_providers(id),
    name VARCHAR(200) NOT NULL,
    model_key VARCHAR(100) NOT NULL, -- API에서 사용하는 모델명 (예: gpt-4, claude-3)
    version VARCHAR(50),
    description TEXT,
    
    -- 모델 특성
    modality VARCHAR(50) DEFAULT 'text', -- text, image, multimodal, audio 등
    context_length INTEGER,
    max_tokens INTEGER,
    supports_streaming BOOLEAN DEFAULT false,
    supports_functions BOOLEAN DEFAULT false,
    
    -- 성능 및 특징
    strengths TEXT[], -- 주요 장점들
    use_cases TEXT[], -- 적합한 용도들
    performance_score INTEGER CHECK (performance_score >= 1 AND performance_score <= 10),
    
    -- 가격 정보
    pricing_tier VARCHAR(20) DEFAULT 'standard', -- free, standard, premium
    input_price_per_1k DECIMAL(10,6), -- 1K 토큰당 입력 가격 (USD)
    output_price_per_1k DECIMAL(10,6), -- 1K 토큰당 출력 가격 (USD)
    
    -- API 정보
    api_available BOOLEAN DEFAULT true,
    api_endpoint TEXT,
    requires_auth BOOLEAN DEFAULT true,
    
    -- 메타 정보
    is_active BOOLEAN DEFAULT true,
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 2. 카테고리 및 태그 시스템
-- ===============================================

-- 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- 이모지나 아이콘 클래스
    parent_id INTEGER REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 태그 테이블
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6', -- HEX 컬러 코드
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 3. 프롬프트 템플릿 시스템
-- ===============================================

-- 프롬프트 템플릿 테이블
CREATE TABLE IF NOT EXISTS prompt_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- 템플릿 내용
    system_prompt TEXT, -- 시스템 프롬프트
    user_prompt_template TEXT NOT NULL, -- 사용자 프롬프트 템플릿 (변수 포함)
    variables JSONB, -- 템플릿 변수 정의 {name, type, description, default}
    
    -- 분류
    category_id INTEGER REFERENCES categories(id),
    difficulty_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
    
    -- 추천 AI 모델
    recommended_models INTEGER[], -- ai_models.id 배열
    
    -- 품질 정보
    effectiveness_score DECIMAL(3,2) DEFAULT 0.0, -- 0.00 ~ 5.00
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.0, -- 성공률 퍼센트
    
    -- 작성자 정보
    author_type VARCHAR(20) DEFAULT 'system', -- system, user, community
    author_name VARCHAR(100),
    
    -- 상태
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active', -- active, archived, draft
    
    -- 메타 정보
    language VARCHAR(10) DEFAULT 'ko',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프롬프트 템플릿-태그 관계 테이블
CREATE TABLE IF NOT EXISTS prompt_template_tags (
    template_id INTEGER REFERENCES prompt_templates(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, tag_id)
);

-- ===============================================
-- 4. 사용자 생성 프롬프트 (기존 개선)
-- ===============================================

DROP TABLE IF EXISTS prompts CASCADE;
CREATE TABLE prompts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    role VARCHAR(100) DEFAULT 'user',
    
    -- 분류
    category_id INTEGER REFERENCES categories(id),
    template_id INTEGER REFERENCES prompt_templates(id), -- 어떤 템플릿에서 생성되었는지
    
    -- 메타 정보
    tags TEXT[], -- 간단한 태그 배열
    language VARCHAR(10) DEFAULT 'ko',
    
    -- 생성 정보
    created_by VARCHAR(100) DEFAULT 'anonymous',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 5. 추천 시스템
-- ===============================================

-- 추천 규칙 테이블 (기존 개선)
DROP TABLE IF EXISTS recommendation_rules CASCADE;
CREATE TABLE recommendation_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- 조건
    keywords TEXT[] NOT NULL,
    purpose_category VARCHAR(50) NOT NULL,
    complexity_level VARCHAR(20), -- simple, medium, complex
    priority_type VARCHAR(20), -- cost, performance, balanced
    
    -- 추천 결과
    recommended_models INTEGER[] NOT NULL, -- ai_models.id 배열
    recommended_templates INTEGER[], -- prompt_templates.id 배열
    
    -- 품질
    confidence_score INTEGER DEFAULT 80 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- 상태
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 6. 사용자 활동 및 피드백 시스템
-- ===============================================

-- 세션 테이블 (사용자 추천 세션)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_uuid UUID DEFAULT gen_random_uuid(),
    user_ip INET,
    user_agent TEXT,
    
    -- 추천 요청 정보
    original_request TEXT, -- 사용자의 원래 요청
    collected_requirements JSONB, -- 질문을 통해 수집된 요구사항
    recommendation_result JSONB, -- 추천 결과
    
    -- 타이밍
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER
);

-- 사용자 피드백 테이블
CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES user_sessions(id),
    
    -- 피드백 대상
    feedback_type VARCHAR(50) NOT NULL, -- recommendation, template, model
    target_id INTEGER, -- 대상의 ID (model_id, template_id 등)
    
    -- 피드백 내용
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 10),
    comment TEXT,
    
    -- 구체적 평가
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
    ease_of_use_rating INTEGER CHECK (ease_of_use_rating >= 1 AND ease_of_use_rating <= 5),
    
    -- 개선 제안
    improvement_suggestion TEXT,
    would_recommend BOOLEAN,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용 로그 테이블
CREATE TABLE IF NOT EXISTS usage_logs (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES user_sessions(id),
    
    -- 액션 정보
    action_type VARCHAR(50) NOT NULL, -- search, recommend, use_template, copy_prompt 등
    target_type VARCHAR(50), -- model, template, prompt
    target_id INTEGER,
    
    -- 세부 정보
    action_data JSONB, -- 액션별 상세 데이터
    result_success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- 타이밍
    duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 7. 버전 관리 시스템
-- ===============================================

-- 컨텐츠 버전 테이블
CREATE TABLE IF NOT EXISTS content_versions (
    id SERIAL PRIMARY KEY,
    
    -- 버전 대상
    content_type VARCHAR(50) NOT NULL, -- ai_model, prompt_template, recommendation_rule
    content_id INTEGER NOT NULL,
    
    -- 버전 정보
    version_number VARCHAR(20) NOT NULL,
    change_type VARCHAR(20) NOT NULL, -- create, update, delete, archive
    
    -- 변경 내용
    old_data JSONB, -- 이전 데이터
    new_data JSONB, -- 새로운 데이터
    change_summary TEXT,
    
    -- 변경자 정보
    changed_by VARCHAR(100) DEFAULT 'system',
    change_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 8. 시스템 설정 및 메타데이터
-- ===============================================

-- 시스템 설정 테이블
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- 클라이언트에 노출 여부
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 통계 테이블
CREATE TABLE IF NOT EXISTS statistics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2),
    metric_type VARCHAR(50), -- count, average, percentage 등
    calculated_for_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 9. 인덱스 생성
-- ===============================================

-- 성능 최적화를 위한 인덱스들
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_modality ON ai_models(modality);
CREATE INDEX IF NOT EXISTS idx_ai_models_active ON ai_models(is_active);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_public ON prompt_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_featured ON prompt_templates(is_featured);

CREATE INDEX IF NOT EXISTS idx_user_sessions_uuid ON user_sessions(session_uuid);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started ON user_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_usage_logs_session ON usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_content_versions_content ON content_versions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_created ON content_versions(created_at);

-- ===============================================
-- 10. 트리거 및 함수
-- ===============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거들
CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON ai_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON prompt_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommendation_rules_updated_at BEFORE UPDATE ON recommendation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 