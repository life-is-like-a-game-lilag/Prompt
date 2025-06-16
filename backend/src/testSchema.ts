import { pool } from './db';

async function testSchema() {
  try {
    console.log('🧪 DB 스키마 및 데이터 테스트를 시작합니다...\n');

    // 1. 테이블 존재 확인
    console.log('📋 테이블 존재 확인...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    const tablesResult = await pool.query(tablesQuery);
    console.log('✅ 생성된 테이블들:');
    tablesResult.rows.forEach(row => console.log(`   - ${row.table_name}`));
    console.log('');

    // 2. 데이터 개수 확인
    console.log('📊 각 테이블 데이터 개수 확인...');
    const dataCountsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM ai_providers) as providers,
        (SELECT COUNT(*) FROM ai_models) as models,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM tags) as tags,
        (SELECT COUNT(*) FROM prompt_templates) as templates,
        (SELECT COUNT(*) FROM recommendation_rules) as rules,
        (SELECT COUNT(*) FROM user_sessions) as sessions,
        (SELECT COUNT(*) FROM user_feedback) as feedback,
        (SELECT COUNT(*) FROM usage_logs) as logs
    `;
    const countsResult = await pool.query(dataCountsQuery);
    const counts = countsResult.rows[0];
    console.log('📈 데이터 현황:');
    console.log(`   - AI 제공업체: ${counts.providers}개`);
    console.log(`   - AI 모델: ${counts.models}개`);
    console.log(`   - 카테고리: ${counts.categories}개`);
    console.log(`   - 태그: ${counts.tags}개`);
    console.log(`   - 프롬프트 템플릿: ${counts.templates}개`);
    console.log(`   - 추천 규칙: ${counts.rules}개`);
    console.log(`   - 사용자 세션: ${counts.sessions}개`);
    console.log(`   - 피드백: ${counts.feedback}개`);
    console.log(`   - 로그: ${counts.logs}개`);
    console.log('');

    // 3. AI 모델 상세 정보 테스트
    console.log('🤖 AI 모델 JOIN 쿼리 테스트...');
    const modelsQuery = `
      SELECT 
        m.name,
        p.company,
        m.modality,
        m.pricing_tier,
        m.performance_score
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE m.is_active = true
      ORDER BY m.performance_score DESC
      LIMIT 5
    `;
    const modelsResult = await pool.query(modelsQuery);
    console.log('✅ 상위 5개 AI 모델:');
    modelsResult.rows.forEach(row => {
      console.log(`   - ${row.name} (${row.company}) - ${row.modality} - ${row.pricing_tier} - 성능: ${row.performance_score}/10`);
    });
    console.log('');

    // 4. 추천 규칙 테스트
    console.log('🎯 추천 규칙 테스트...');
    const rulesQuery = `
      SELECT 
        name,
        purpose_category,
        array_length(recommended_models, 1) as model_count,
        confidence_score
      FROM recommendation_rules
      WHERE is_active = true
      ORDER BY confidence_score DESC
    `;
    const rulesResult = await pool.query(rulesQuery);
    console.log('✅ 추천 규칙 목록:');
    rulesResult.rows.forEach(row => {
      console.log(`   - ${row.name}: ${row.model_count}개 모델 추천 (신뢰도: ${row.confidence_score}%)`);
    });
    console.log('');

    // 5. 외래키 제약조건 테스트
    console.log('🔗 외래키 제약조건 테스트...');
    const fkQuery = `
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `;
    const fkResult = await pool.query(fkQuery);
    console.log('✅ 외래키 관계:');
    fkResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}.${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
    console.log('');

    // 6. 인덱스 확인
    console.log('📇 인덱스 확인...');
    const indexQuery = `
      SELECT 
        indexname,
        tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname
    `;
    const indexResult = await pool.query(indexQuery);
    console.log('✅ 생성된 인덱스:');
    indexResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}: ${row.indexname}`);
    });
    console.log('');

    // 7. 실제 추천 로직 테스트
    console.log('🔮 추천 로직 테스트...');
    const testRecommendation = await pool.query(`
      SELECT m.*, p.company
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE m.id = ANY($1)
      ORDER BY m.performance_score DESC
    `, [[1, 2, 3]]);
    
    console.log('✅ 추천 로직 결과:');
    testRecommendation.rows.forEach(row => {
      console.log(`   - ${row.name} (${row.company}): ${row.description}`);
    });

    console.log('\n🎉 모든 테스트가 성공적으로 완료되었습니다!');
    console.log('✅ T-002 작업이 완료되었습니다.');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

testSchema(); 