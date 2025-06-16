import { pool } from './db';
import * as fs from 'fs';
import * as path from 'path';

async function migrateSchema() {
  try {
    console.log('🔄 데이터베이스 스키마 마이그레이션을 시작합니다...\n');

    // 1. 스키마 파일 읽기 및 실행
    console.log('📋 새로운 스키마 적용 중...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schemaSql);
    console.log('✅ 스키마 적용 완료\n');

    // 2. AI 제공업체 데이터 삽입
    console.log('🏢 AI 제공업체 데이터 삽입 중...');
    const providers = [
      { name: 'OpenAI', company: 'OpenAI', website: 'https://openai.com', api_base: 'https://api.openai.com/v1' },
      { name: 'Anthropic', company: 'Anthropic', website: 'https://anthropic.com', api_base: 'https://api.anthropic.com' },
      { name: 'Google AI', company: 'Google', website: 'https://ai.google.dev', api_base: 'https://generativelanguage.googleapis.com' },
      { name: 'Stability AI', company: 'Stability AI', website: 'https://stability.ai', api_base: 'https://api.stability.ai' },
      { name: 'Midjourney', company: 'Midjourney Inc.', website: 'https://midjourney.com', api_base: null }
    ];

    for (const provider of providers) {
      await pool.query(
        `INSERT INTO ai_providers (name, company, website_url, api_base_url) 
         VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING`,
        [provider.name, provider.company, provider.website, provider.api_base]
      );
    }
    console.log('✅ AI 제공업체 데이터 삽입 완료\n');

    // 3. 개선된 AI 모델 데이터 삽입
    console.log('🤖 AI 모델 데이터 삽입 중...');
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
      // 제공업체 ID 조회
      const providerResult = await pool.query('SELECT id FROM ai_providers WHERE name = $1', [model.provider]);
      const providerId = providerResult.rows[0]?.id;

      if (providerId) {
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
      }
    }
    console.log('✅ AI 모델 데이터 삽입 완료\n');

    // 4. 카테고리 데이터 삽입
    console.log('📂 카테고리 데이터 삽입 중...');
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
      await pool.query(
        `INSERT INTO categories (name, description, icon, sort_order) 
         VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING`,
        [cat.name, cat.description, cat.icon, i + 1]
      );
    }
    console.log('✅ 카테고리 데이터 삽입 완료\n');

    // 5. 태그 데이터 삽입
    console.log('🏷️ 태그 데이터 삽입 중...');
    const tags = [
      { name: '초보자', color: '#10B981' },
      { name: '고급', color: '#F59E0B' },
      { name: '빠른답변', color: '#3B82F6' },
      { name: '창의적', color: '#8B5CF6' },
      { name: '분석적', color: '#EF4444' },
      { name: '실용적', color: '#6B7280' },
      { name: '전문적', color: '#1F2937' },
      { name: '교육용', color: '#059669' }
    ];

    for (const tag of tags) {
      await pool.query(
        `INSERT INTO tags (name, color) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [tag.name, tag.color]
      );
    }
    console.log('✅ 태그 데이터 삽입 완료\n');

    // 6. 개선된 추천 규칙 삽입
    console.log('🎯 추천 규칙 데이터 삽입 중...');
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
    console.log('✅ 추천 규칙 데이터 삽입 완료\n');

    // 7. 데이터 확인
    console.log('📊 마이그레이션 결과 확인...');
    const results = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ai_providers) as providers,
        (SELECT COUNT(*) FROM ai_models) as models,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM tags) as tags,
        (SELECT COUNT(*) FROM recommendation_rules) as rules
    `);
    
    const counts = results.rows[0];
    console.log(`📈 데이터 현황:`);
    console.log(`   - AI 제공업체: ${counts.providers}개`);
    console.log(`   - AI 모델: ${counts.models}개`);
    console.log(`   - 카테고리: ${counts.categories}개`);
    console.log(`   - 태그: ${counts.tags}개`);
    console.log(`   - 추천 규칙: ${counts.rules}개`);

    console.log('\n🎉 데이터베이스 마이그레이션이 성공적으로 완료되었습니다!');

  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

migrateSchema(); 