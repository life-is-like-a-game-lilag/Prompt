import { pool } from './db';

async function testDatabase() {
  try {
    console.log('=== AI 모델 테이블 구조 확인 ===');
    const tableStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ai_models'
      ORDER BY ordinal_position
    `);
    console.log('ai_models 테이블 컬럼:');
    tableStructure.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n=== 모든 AI 모델 데이터 ===');
    const modelsResult = await pool.query('SELECT * FROM ai_models');
    console.log('모델 개수:', modelsResult.rows.length);
    modelsResult.rows.forEach((model, idx) => {
      console.log(`${idx + 1}. ${model.name} (${model.provider})`);
      console.log(`   설명: ${model.description}`);
      console.log(`   장점: ${model.strengths}`);
      console.log(`   용도: ${model.use_cases}`);
      console.log(`   가격: ${model.pricing_tier}`);
      console.log('');
    });
    
    console.log('\n=== 테스트 완료 ===');
  } catch (error) {
    console.error('테스트 에러:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 