import { pool } from './db';

async function addImageAIModels() {
  try {
    console.log('🎨 이미지 AI 모델들을 추가합니다...');

    // 이미지 AI 모델들 추가
    const imageModels = [
      {
        name: 'DALL-E 3',
        provider: 'OpenAI',
        description: '고품질 이미지 생성 AI',
        strengths: ['이미지 생성', '창의적 표현', '텍스트 이해'],
        use_cases: ['일러스트 제작', '로고 디자인', '컨셉 아트'],
        pricing_tier: 'premium',
        api_available: true
      },
      {
        name: 'Midjourney',
        provider: 'Midjourney',
        description: '예술적이고 창의적인 이미지 생성',
        strengths: ['예술적 품질', '스타일 다양성', '고해상도'],
        use_cases: ['예술 작품', '창작물', '상업용 이미지'],
        pricing_tier: 'premium',
        api_available: false
      },
      {
        name: 'Stable Diffusion',
        provider: 'Stability AI',
        description: '오픈소스 이미지 생성 모델',
        strengths: ['무료 사용', '커스터마이징', '빠른 생성'],
        use_cases: ['개인 프로젝트', '실험', '프로토타이핑'],
        pricing_tier: 'free',
        api_available: true
      }
    ];

    for (const model of imageModels) {
      await pool.query(
        `INSERT INTO ai_models (name, provider, description, strengths, use_cases, pricing_tier, api_available)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [model.name, model.provider, model.description, model.strengths, model.use_cases, model.pricing_tier, model.api_available]
      );
      console.log(`✅ ${model.name} 추가됨`);
    }

    console.log('\n📊 현재 모든 AI 모델:');
    const allModels = await pool.query('SELECT id, name, provider FROM ai_models ORDER BY id');
    allModels.rows.forEach(model => {
      console.log(`${model.id}. ${model.name} (${model.provider})`);
    });

    console.log('\n🎉 이미지 AI 모델 추가 완료!');
  } catch (error) {
    console.error('에러:', error);
  } finally {
    process.exit(0);
  }
}

addImageAIModels(); 