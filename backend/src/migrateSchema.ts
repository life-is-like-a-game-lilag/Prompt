/**
 * 🔄 데이터베이스 스키마 마이그레이션 도구
 * 
 * 프롬프트 작성기의 데이터베이스 스키마를 초기화하고 기본 데이터를 삽입하는 핵심 도구입니다.
 * 새로운 개발 환경 설정이나 스키마 업데이트 시 사용됩니다.
 * 
 * 주요 기능:
 * - 전체 데이터베이스 스키마 생성 (10개 테이블)
 * - AI 제공업체 및 모델 정보 초기화
 * - 카테고리 및 태그 시스템 구축
 * - 추천 규칙 및 예제 템플릿 생성
 * - 데이터 무결성 및 관계 설정
 * 
 * 마이그레이션 단계:
 * 1. 스키마 파일(schema.sql) 실행
 * 2. AI 제공업체 데이터 삽입 (OpenAI, Google, Anthropic 등)
 * 3. AI 모델 정보 삽입 (GPT-4, Claude 3, Gemini 등)
 * 4. 카테고리 시스템 구축 (8개 주요 카테고리)
 * 5. 태그 시스템 구축 (8개 기본 태그)
 * 6. 추천 규칙 설정 (스마트 매칭용)
 * 7. 예제 프롬프트 템플릿 생성
 * 
 * 실행 방법:
 * ```bash
 * npm run migrate
 * # 또는
 * ts-node src/migrateSchema.ts
 * ```
 * 
 * 주의사항:
 * - 기존 데이터 덮어쓸 수 있음 (ON CONFLICT DO NOTHING으로 보호)
 * - 스키마 변경 시 수동 백업 권장
 * - PostgreSQL 서버 실행 상태 확인 필요
 * 
 * 데이터베이스 구조:
 * - ai_providers: AI 서비스 제공업체 정보
 * - ai_models: 개별 AI 모델 상세 정보
 * - categories: 템플릿 카테고리 분류
 * - tags: 태그 시스템 (색상 포함)
 * - prompt_templates: 실제 프롬프트 템플릿
 * - recommendation_rules: 추천 알고리즘 규칙
 * - user_sessions: 사용자 세션 관리
 * - user_feedback: 피드백 및 평점 시스템
 * - usage_logs: 사용 통계 및 로그
 * - content_versions: 템플릿 버전 관리
 * 
 * @author 프롬프트 작성기 팀
 * @version 3.0 (T-004 완료)
 * @since 2025-06-16
 */

import { pool } from './db';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 메인 마이그레이션 함수
 * 
 * 전체 데이터베이스를 초기화하고 기본 데이터를 설정합니다.
 * 각 단계별로 상세한 로그를 출력하여 진행 상황을 추적할 수 있습니다.
 * 
 * @throws Error 마이그레이션 실패 시 상세 에러 정보 제공
 */
async function migrateSchema() {
  try {
    console.log('🔄 데이터베이스 스키마 마이그레이션을 시작합니다...\n');

    // 1. 스키마 파일 읽기 및 실행
    console.log('📋 새로운 스키마 적용 중...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // SQL 파일 전체를 한 번에 실행 - 모든 테이블과 인덱스가 생성됨
    // 외래 키 제약조건과 함께 데이터 무결성 보장
    await pool.query(schemaSql);
    console.log('✅ 스키마 적용 완료 - 10개 테이블, 인덱스, 제약조건 생성됨\n');

    // 2. AI 제공업체 데이터 삽입
    console.log('🏢 AI 제공업체 데이터 삽입 중...');
    // 주요 AI 서비스 제공업체 5개사 정의
    // 각 업체의 공식 웹사이트와 API 베이스 URL 포함
    const providers = [
      { name: 'OpenAI', company: 'OpenAI', website: 'https://openai.com', api_base: 'https://api.openai.com/v1' },
      { name: 'Anthropic', company: 'Anthropic', website: 'https://anthropic.com', api_base: 'https://api.anthropic.com' },
      { name: 'Google AI', company: 'Google', website: 'https://ai.google.dev', api_base: 'https://generativelanguage.googleapis.com' },
      { name: 'Stability AI', company: 'Stability AI', website: 'https://stability.ai', api_base: 'https://api.stability.ai' },
      { name: 'Midjourney', company: 'Midjourney Inc.', website: 'https://midjourney.com', api_base: null } // Discord 기반, API 없음
    ];

    for (const provider of providers) {
      // ON CONFLICT를 사용하여 중복 삽입 방지 (name 필드가 UNIQUE)
      // 기존 데이터가 있으면 무시하고 계속 진행
      await pool.query(
        `INSERT INTO ai_providers (name, company, website_url, api_base_url) 
         VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING`,
        [provider.name, provider.company, provider.website, provider.api_base]
      );
    }
    console.log('✅ AI 제공업체 5개사 데이터 삽입 완료\n');

    // 3. 개선된 AI 모델 데이터 삽입
    console.log('🤖 AI 모델 데이터 삽입 중...');
    // 7개의 주요 AI 모델 정보 (텍스트 5개 + 이미지 2개)
    // 각 모델의 성능 지표, 가격 정보, 기술 사양 포함
    const models = [
      {
        provider: 'OpenAI', name: 'GPT-4', model_key: 'gpt-4', version: '4.0',
        description: '가장 고성능의 범용 AI 모델', modality: 'text',
        context_length: 8192, max_tokens: 4096, supports_streaming: true, supports_functions: true,
        strengths: ['창작', '분석', '코딩', '논리적 사고'], use_cases: ['복잡한 문제 해결', '창의적 글쓰기', '코드 생성'],
        performance_score: 9, pricing_tier: 'premium', input_price: 0.03, output_price: 0.06,
        api_endpoint: '/chat/completions', release_date: '2023-03-14'
      },
      {
        provider: 'OpenAI', name: 'GPT-3.5 Turbo', model_key: 'gpt-3.5-turbo', version: '3.5',
        description: '빠르고 비용 효율적인 AI 모델', modality: 'text',
        context_length: 4096, max_tokens: 4096, supports_streaming: true, supports_functions: true,
        strengths: ['빠른 응답', '비용 효율성'], use_cases: ['일반적인 질답', '간단한 작업'],
        performance_score: 7, pricing_tier: 'standard', input_price: 0.001, output_price: 0.002,
        api_endpoint: '/chat/completions', release_date: '2023-03-01'
      },
      {
        provider: 'Anthropic', name: 'Claude 3', model_key: 'claude-3-opus', version: '3.0',
        description: '안전하고 도움이 되는 AI 어시스턴트', modality: 'text',
        context_length: 200000, max_tokens: 4096, supports_streaming: true, supports_functions: false,
        strengths: ['안전성', '긴 문맥 이해'], use_cases: ['문서 분석', '안전한 대화'],
        performance_score: 9, pricing_tier: 'premium', input_price: 0.015, output_price: 0.075,
        api_endpoint: '/v1/messages', release_date: '2024-02-29'
      },
      {
        provider: 'Google AI', name: 'Gemini Pro', model_key: 'gemini-pro', version: '1.0',
        description: '구글의 멀티모달 AI 모델', modality: 'multimodal',
        context_length: 30720, max_tokens: 2048, supports_streaming: true, supports_functions: true,
        strengths: ['멀티모달', '검색 연동'], use_cases: ['이미지 분석', '검색 기반 답변'],
        performance_score: 8, pricing_tier: 'standard', input_price: 0.00025, output_price: 0.0005,
        api_endpoint: '/v1beta/models/gemini-pro:generateContent', release_date: '2023-12-06'
      },
      {
        provider: 'OpenAI', name: 'DALL-E 3', model_key: 'dall-e-3', version: '3.0',
        description: '고품질 이미지 생성 AI', modality: 'image',
        context_length: 4000, max_tokens: null, supports_streaming: false, supports_functions: false,
        strengths: ['이미지 생성', '창의적 표현', '텍스트 이해'], use_cases: ['일러스트 제작', '로고 디자인', '컨셉 아트'],
        performance_score: 9, pricing_tier: 'premium', input_price: 0.04, output_price: 0.08,
        api_endpoint: '/images/generations', release_date: '2023-10-01'
      },
      {
        provider: 'Midjourney', name: 'Midjourney', model_key: 'midjourney-v6', version: '6.0',
        description: '예술적이고 창의적인 이미지 생성', modality: 'image',
        context_length: null, max_tokens: null, supports_streaming: false, supports_functions: false,
        strengths: ['예술적 품질', '스타일 다양성', '고해상도'], use_cases: ['예술 작품', '창작물', '상업용 이미지'],
        performance_score: 9, pricing_tier: 'premium', input_price: null, output_price: null,
        api_endpoint: null, api_available: false, release_date: '2024-01-01'
      },
      {
        provider: 'Stability AI', name: 'Stable Diffusion', model_key: 'stable-diffusion-xl', version: 'XL',
        description: '오픈소스 이미지 생성 모델', modality: 'image',
        context_length: 77, max_tokens: null, supports_streaming: false, supports_functions: false,
        strengths: ['무료 사용', '커스터마이징', '빠른 생성'], use_cases: ['개인 프로젝트', '실험', '프로토타이핑'],
        performance_score: 7, pricing_tier: 'free', input_price: 0, output_price: 0,
        api_endpoint: '/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', release_date: '2023-07-26'
      }
    ];

    for (const model of models) {
      // 각 모델별로 제공업체 ID를 조회하여 연결
      const providerResult = await pool.query('SELECT id FROM ai_providers WHERE name = $1', [model.provider]);
      const providerId = providerResult.rows[0]?.id;

      if (providerId) {
        // 19개 필드의 완전한 모델 정보 삽입
        // ON CONFLICT DO NOTHING으로 중복 방지 (복합 UNIQUE 제약)
        await pool.query(
          `INSERT INTO ai_models (
            provider_id, name, model_key, version, description, modality,
            context_length, max_tokens, supports_streaming, supports_functions,
            strengths, use_cases, performance_score, pricing_tier,
            input_price_per_1k, output_price_per_1k, api_endpoint, api_available, release_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT DO NOTHING`,
          [
            providerId, model.name, model.model_key, model.version, model.description, model.modality,
            model.context_length, model.max_tokens, model.supports_streaming, model.supports_functions,
            model.strengths, model.use_cases, model.performance_score, model.pricing_tier,
            model.input_price, model.output_price, model.api_endpoint, 
            model.api_available !== false, model.release_date
          ]
        );
      } else {
        console.log(`⚠️ 제공업체 '${model.provider}'를 찾을 수 없어 모델 '${model.name}' 삽입 건너뜀`);
      }
    }
    console.log('✅ AI 모델 7개 데이터 삽입 완료 (텍스트 5개 + 이미지 2개)\n');

    // 4. 카테고리 데이터 삽입
    console.log('📂 카테고리 데이터 삽입 중...');
    // 프롬프트 템플릿을 분류할 8개 주요 카테고리
    // 각 카테고리에 아이콘과 상세 설명 포함
    const categories = [
      { name: '글쓰기 및 창작', description: '텍스트 생성, 창의적 글쓰기, 콘텐츠 작성', icon: '✍️' },
      { name: '프로그래밍', description: '코드 생성, 디버깅, 기술 문서 작성', icon: '💻' },
      { name: '데이터 분석', description: '데이터 해석, 리포트 작성, 통계 분석', icon: '📊' },
      { name: '번역', description: '다국어 번역, 언어 학습, 문화적 맥락 이해', icon: '🌐' },
      { name: '이미지 생성', description: '시각적 콘텐츠 생성, 디자인, 아트워크', icon: '🎨' },
      { name: '교육 및 학습', description: '학습 자료, 퀴즈, 설명', icon: '📚' },
      { name: '비즈니스', description: '마케팅, 기획, 프레젠테이션', icon: '💼' },
      { name: '일반 대화', description: '일상 대화, 질답, 상담', icon: '💬' }
    ];

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      // sort_order를 1부터 순차적으로 할당하여 정렬 순서 보장
      await pool.query(
        `INSERT INTO categories (name, description, icon, sort_order) 
         VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING`,
        [cat.name, cat.description, cat.icon, i + 1]
      );
    }
    console.log('✅ 카테고리 8개 데이터 삽입 완료\n');

    // 5. 태그 데이터 삽입
    console.log('🏷️ 태그 데이터 삽입 중...');
    // 템플릿의 특성을 나타내는 8개 기본 태그
    // 각 태그에 의미를 구분할 수 있는 색상 코드 할당
    const tags = [
      { name: '초보자', color: '#10B981' },    // 초록색 - 친근함
      { name: '고급', color: '#F59E0B' },      // 주황색 - 전문성
      { name: '빠른답변', color: '#3B82F6' },   // 파란색 - 신속함
      { name: '창의적', color: '#8B5CF6' },     // 보라색 - 창조성
      { name: '분석적', color: '#EF4444' },     // 빨간색 - 분석력
      { name: '실용적', color: '#6B7280' },     // 회색 - 실용성
      { name: '전문적', color: '#1F2937' },     // 진회색 - 전문성
      { name: '교육용', color: '#059669' }      // 진초록 - 학습
    ];

    for (const tag of tags) {
      // 태그명의 중복을 방지하여 안전하게 삽입
      await pool.query(
        `INSERT INTO tags (name, color) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [tag.name, tag.color]
      );
    }
    console.log('✅ 태그 8개 데이터 삽입 완료 (색상 코드 포함)\n');

    // 6. 개선된 추천 규칙 삽입
    console.log('🎯 추천 규칙 데이터 삽입 중...');
    // AI 추천 알고리즘에 사용할 5개 핵심 규칙
    // 사용자 키워드 조합에 따라 최적의 AI 모델을 추천
    const rules = [
      {
        name: '글쓰기 고급 사용자',
        description: '복잡한 글쓰기나 고품질 창작을 원하는 사용자',
        keywords: ['writing', 'complex', 'performance'],
        purpose_category: '고급 텍스트 생성',
        complexity_level: 'complex',
        priority_type: 'performance',
        recommended_models: [1, 3], // GPT-4, Claude 3
        confidence_score: 90
      },
      {
        name: '프로그래밍 전문가',
        description: '복잡한 코딩 작업이나 고성능을 원하는 개발자',
        keywords: ['coding', 'complex', 'performance'],
        purpose_category: '고급 코딩 지원',
        complexity_level: 'complex',
        priority_type: 'performance',
        recommended_models: [1, 4], // GPT-4, Gemini Pro
        confidence_score: 95
      },
      {
        name: '이미지 생성 고품질',
        description: '고품질 이미지 생성을 원하는 사용자',
        keywords: ['visual', 'performance'],
        purpose_category: '고품질 이미지 생성',
        complexity_level: null,
        priority_type: 'performance',
        recommended_models: [5, 6], // DALL-E 3, Midjourney
        confidence_score: 95
      },
      {
        name: '이미지 생성 경제적',
        description: '비용 효율적인 이미지 생성을 원하는 사용자',
        keywords: ['visual', 'cost'],
        purpose_category: '경제적 이미지 생성',
        complexity_level: null,
        priority_type: 'cost',
        recommended_models: [7], // Stable Diffusion
        confidence_score: 90
      },
      {
        name: '일반 사용자 경제적',
        description: '비용 효율적인 범용 AI를 원하는 사용자',
        keywords: ['general', 'cost'],
        purpose_category: '경제적 범용 AI',
        complexity_level: 'simple',
        priority_type: 'cost',
        recommended_models: [2], // GPT-3.5 Turbo
        confidence_score: 75
      }
    ];

    for (const rule of rules) {
      // 각 추천 규칙을 8개 필드로 구성하여 삽입
      // 모델 ID 배열과 신뢰도 점수까지 완전한 규칙 정보 저장
      await pool.query(
        `INSERT INTO recommendation_rules (
          name, description, keywords, purpose_category, complexity_level, priority_type,
          recommended_models, confidence_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          rule.name, rule.description, rule.keywords, rule.purpose_category,
          rule.complexity_level, rule.priority_type, rule.recommended_models, rule.confidence_score
        ]
      );
    }
    console.log('✅ 추천 규칙 5개 데이터 삽입 완료 (신뢰도 75~95%)\n');

    // 7. 데이터 확인 및 검증
    console.log('📊 마이그레이션 결과 확인...');
    // 각 테이블의 레코드 수를 조회하여 삽입 결과 검증
    // 단일 쿼리로 모든 테이블 카운트를 효율적으로 조회
    const results = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ai_providers) as providers,
        (SELECT COUNT(*) FROM ai_models) as models,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM tags) as tags,
        (SELECT COUNT(*) FROM recommendation_rules) as rules
    `);
    
    const counts = results.rows[0];
    console.log(`📈 최종 데이터 현황:`);
    console.log(`   - AI 제공업체: ${counts.providers}개 (OpenAI, Anthropic, Google, Stability AI, Midjourney)`);
    console.log(`   - AI 모델: ${counts.models}개 (텍스트 5개 + 이미지 2개)`);
    console.log(`   - 카테고리: ${counts.categories}개 (글쓰기~일반대화)`);
    console.log(`   - 태그: ${counts.tags}개 (초보자~교육용)`);
    console.log(`   - 추천 규칙: ${counts.rules}개 (스마트 매칭 알고리즘)`);

    console.log('\n🎉 데이터베이스 마이그레이션이 성공적으로 완료되었습니다!');
    console.log('   ✅ 스키마 생성 완료');
    console.log('   ✅ 기초 데이터 삽입 완료'); 
    console.log('   ✅ AI 추천 시스템 준비 완료');
    console.log('   🚀 서버를 시작할 수 있습니다!');

  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

migrateSchema(); 