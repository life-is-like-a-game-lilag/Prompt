import { pool } from './db';

const createTableSQL = `
CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  role VARCHAR(100),
  tags VARCHAR(50)[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function init() {
  try {
    await pool.query(createTableSQL);
    console.log('✅ prompts 테이블이 생성되었습니다.');
  } catch (err) {
    console.error('❌ 테이블 생성 실패:', err);
  } finally {
    await pool.end();
  }
}

init(); 